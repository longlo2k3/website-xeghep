import type { Payload } from 'payload';

import { sendFallbackEmail } from './email';
import { buildBookingMessage } from './message';
import { sendTelegramMessage } from './telegram';

const POLL_INTERVAL_MS = 5_000;
const RETRY_DELAYS_MS = [5_000, 30_000, 120_000];
const MAX_ATTEMPTS = 3;

/** backoff: lần 1 → 5s, lần 2 → 30s, lần 3 → 2 phút, ≥4 → dừng. */
export function nextRetryDelayMs(attempt: number): number | null {
  return RETRY_DELAYS_MS[attempt - 1] ?? null;
}

export function shouldFallbackToEmail(attempts: number, notifiedAt: unknown): boolean {
  return attempts >= MAX_ATTEMPTS && !notifiedAt;
}

export type NotificationConfig = {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailEnabled: boolean;
  emailWebhookUrl: string;
  emailTo: string;
};

export async function loadNotificationConfig(payload: Payload): Promise<NotificationConfig> {
  let doc: any = null;
  try {
    doc = await payload.findGlobal({
      slug: 'notification_settings',
      overrideAccess: true,
    });
  } catch {
    doc = null;
  }

  const telegramBotToken =
    String(doc?.telegramBotToken ?? '').trim() || (process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  const telegramChatId =
    String(doc?.telegramChatId ?? '').trim() || (process.env.TELEGRAM_CHAT_ID ?? '').trim();
  const emailWebhookUrl =
    String(doc?.emailWebhookUrl ?? '').trim() || (process.env.NOTIFY_EMAIL_WEBHOOK ?? '').trim();
  const emailTo =
    String(doc?.emailTo ?? '').trim() || (process.env.NOTIFY_EMAIL_TO ?? '').trim();

  return {
    telegramEnabled: doc?.telegramEnabled !== false,
    telegramBotToken,
    telegramChatId,
    emailEnabled: doc?.emailEnabled !== false,
    emailWebhookUrl,
    emailTo,
  };
}

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;
let unconfiguredLogged = false;
const nextAttemptAt = new Map<string, number>();
const fallbackEmailed = new Set<string>();

export function startNotifyWorker(payload: Payload): void {
  if (timer) return;
  timer = setInterval(() => {
    void notifyTick(payload);
  }, POLL_INTERVAL_MS);
  if (typeof timer === 'object' && timer && 'unref' in timer) {
    (timer as { unref?: () => void }).unref?.();
  }
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  console.log(
    `[notify] worker started (${POLL_INTERVAL_MS}ms)${
      token ? '' : ' — TELEGRAM_NOT_CONFIGURED'
    }`,
  );
}

export function stopNotifyWorker(): void {
  if (timer) clearInterval(timer);
  timer = null;
  running = false;
  unconfiguredLogged = false;
  nextAttemptAt.clear();
  fallbackEmailed.clear();
}

export async function notifyTick(payload: Payload): Promise<void> {
  if (running) return;
  running = true;
  try {
    const config = await loadNotificationConfig(payload);
    if (!config.telegramEnabled || !config.telegramBotToken) {
      if (!unconfiguredLogged) {
        unconfiguredLogged = true;
        console.log(
          `[notify] ${
            !config.telegramEnabled ? 'TELEGRAM_DISABLED' : 'TELEGRAM_NOT_CONFIGURED'
          } — bỏ qua gửi Telegram, không đếm lần thử`,
        );
      }
      return;
    }

    const result = await payload.find({
      collection: 'bookings',
      depth: 1,
      limit: 10,
      overrideAccess: true,
      sort: 'createdAt',
      where: { notifiedAt: { exists: false } },
    });

    const now = Date.now();
    for (const doc of result.docs) {
      const key = String(doc.id);
      const attempts = Number(doc.notifyAttempts ?? 0);
      if (attempts >= MAX_ATTEMPTS) continue;
      const dueAt = nextAttemptAt.get(key) ?? 0;
      if (dueAt > now) continue;

      const message = buildBookingMessage(doc, {});
      const sent = await sendTelegramMessage(message, {
        token: config.telegramBotToken,
        chatId: config.telegramChatId,
      });

      if (sent.ok) {
        nextAttemptAt.delete(key);
        await payload.update({
          collection: 'bookings',
          id: doc.id,
          overrideAccess: true,
          data: { notifiedAt: new Date().toISOString(), notifyError: null },
        });
        continue;
      }

      const nextAttempts = attempts + 1;
      const error = String(sent.error ?? 'unknown error').slice(0, 500);
      const delay = nextRetryDelayMs(nextAttempts);
      if (delay != null) nextAttemptAt.set(key, now + delay);
      else nextAttemptAt.delete(key);

      await payload.update({
        collection: 'bookings',
        id: doc.id,
        overrideAccess: true,
        data: { notifyAttempts: nextAttempts, notifyError: error },
      });

      if (
        config.emailEnabled &&
        shouldFallbackToEmail(nextAttempts, doc.notifiedAt) &&
        !fallbackEmailed.has(key)
      ) {
        fallbackEmailed.add(key);
        await sendFallbackEmail(
          `[Xe Ghép Liên Tỉnh] Đơn chưa thông báo ${doc.bookingCode ?? key}`,
          message,
          {
            webhook: config.emailWebhookUrl,
            to: config.emailTo,
          },
        );
      }
    }
  } catch (err) {
    console.error('[notify] tick error:', err instanceof Error ? err.message : err);
  } finally {
    running = false;
  }
}
