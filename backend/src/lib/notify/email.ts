export type EmailResult = { ok: boolean; skipped?: boolean; error?: string };

export type EmailOptions = {
  webhook?: string;
  to?: string;
};

export async function sendFallbackEmail(
  subject: string,
  body: string,
  options?: EmailOptions,
): Promise<EmailResult> {
  const webhook = (options?.webhook ?? process.env.NOTIFY_EMAIL_WEBHOOK ?? '').trim();
  if (!webhook) {
    console.error(`[notify][EMAIL-FALLBACK] ${subject}\n${body}`);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        to: (options?.to ?? process.env.NOTIFY_EMAIL_TO ?? '').trim(),
        subject,
        body,
      }),
    });
    if (!res.ok) return { ok: false, error: `webhook HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
