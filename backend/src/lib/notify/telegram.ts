export type TelegramResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

export type TelegramOptions = {
  token?: string;
  chatId?: string;
};

const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramMessage(
  text: string,
  options?: TelegramOptions,
): Promise<TelegramResult> {
  const token = (options?.token ?? process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  if (!token) return { ok: true, skipped: true };

  const chatId = (options?.chatId ?? process.env.TELEGRAM_CHAT_ID ?? '').trim();
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const payload = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null;
    if (!res.ok || !payload?.ok) {
      return { ok: false, error: payload?.description || `Telegram HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
