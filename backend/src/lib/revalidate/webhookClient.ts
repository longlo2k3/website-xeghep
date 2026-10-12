export type RevalidateCollection =
  | "routes"
  | "articles"
  | "pages"
  | "company_settings"
  | "pricing_settings"
  | "airport_pricing"
  | "distance_rates"
  | "redirects";

export type RevalidateAction = "create" | "update" | "delete" | "publish" | "unpublish";

export type RevalidateEvent = {
  action: RevalidateAction;
  collection: RevalidateCollection;
  previousSlug?: string | null;
  slug?: string | null;
};

export type SendResult =
  | { ok: true; status: number }
  | { ok: false; error: string; status?: number };

export const REVALIDATE_TIMEOUT_MS = 5000;

const WEBHOOK_PATH = "/api/v1/webhooks/revalidate";

/** Slug rỗng/không phải chuỗi → null. */
export function toSlugOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Tính `action` cho afterChange (spec 5.5): create / publish / unpublish / update.
 * Đổi slug (kể cả khi đang published) luôn gửi `previousSlug` kèm `update`.
 */
export function resolveAfterChangeAction(input: {
  doc?: Record<string, any> | null;
  operation?: string;
  previousDoc?: Record<string, any> | null;
}): RevalidateAction {
  const { doc, previousDoc, operation } = input;
  if (!doc) return "update";
  if (operation === "create") return "create";

  const hasStatus = typeof doc.status === "string";
  const prevStatus = typeof previousDoc?.status === "string" ? previousDoc.status : null;
  if (hasStatus && prevStatus !== null && doc.status !== prevStatus) {
    if (doc.status === "published") return "publish";
    if (prevStatus === "published") return "unpublish";
  }
  return "update";
}

/** Ghép body POST tới webhook revalidate theo hợp đồng spec §5.5. */
export function buildRevalidateBody(event: RevalidateEvent): Record<string, unknown> {
  return {
    collection: event.collection,
    slug: event.slug ?? null,
    previousSlug: event.previousSlug ?? null,
    action: event.action,
  };
}

/** URL gốc để gọi webhook: ưu tiên REVALIDATE_URL, fallback FRONTEND_URL. */
export function resolveRevalidateBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const raw = (env.REVALIDATE_URL || env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
  return raw === "" ? null : raw;
}

/**
 * Gửi 1 sự kiện revalidate (spec 5.5). Không ném lỗi — trả `{ok:false}` khi thiếu
 * env, timeout hoặc HTTP ≠ 2xx. Secret không được log.
 */
export async function sendRevalidateEvent(
  event: RevalidateEvent,
  options: {
    env?: Record<string, string | undefined>;
    fetchFn?: typeof fetch;
  } = {},
): Promise<SendResult> {
  const env = options.env ?? process.env;
  const fetchFn = options.fetchFn ?? fetch;
  const baseUrl = resolveRevalidateBaseUrl(env);
  if (!baseUrl) {
    return { ok: false, error: "Thiếu REVALIDATE_URL/FRONTEND_URL — bỏ qua revalidate." };
  }
  const secret = env.REVALIDATE_SECRET;
  if (!secret) {
    return { ok: false, error: "Thiếu REVALIDATE_SECRET — bỏ qua revalidate." };
  }

  try {
    const res = await fetchFn(`${baseUrl}${WEBHOOK_PATH}`, {
      body: JSON.stringify(buildRevalidateBody(event)),
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      method: "POST",
      signal: AbortSignal.timeout(REVALIDATE_TIMEOUT_MS),
    });
    if (!res.ok) {
      return { ok: false, error: `Webhook trả ${res.status}`, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Gọi webhook thất bại: ${message}` };
  }
}

/**
 * Fire-and-forget (T077): không await, không throw — lỗi không bao giờ chặn
 * thao tác admin. Lỗi chỉ ghi `console.warn` (không kèm secret).
 */
export function fireAndForgetRevalidate(event: RevalidateEvent): void {
  void sendRevalidateEvent(event).then((result) => {
    if (!result.ok) {
      console.warn(
        `[revalidate] ${event.collection}/${event.slug ?? "-"} (${event.action}): ${result.error}`,
      );
    }
  });
}
