import { timingSafeEqual } from "node:crypto";

export const REVALIDATE_SECRET_HEADER = "x-revalidate-secret";

export const REVALIDATE_ACTIONS = ["create", "update", "delete", "publish", "unpublish"] as const;
export type RevalidateAction = (typeof REVALIDATE_ACTIONS)[number];

export const REVALIDATE_COLLECTIONS = [
  "routes",
  "articles",
  "pages",
  "company_settings",
  "pricing_settings",
  "airport_pricing",
  "distance_rates",
  "redirects",
] as const;
export type RevalidateCollection = (typeof REVALIDATE_COLLECTIONS)[number];

export type RevalidatePayload = {
  collection: RevalidateCollection;
  slug: string | null;
  previousSlug: string | null;
  action: string | null;
};

/**
 * Bảng tag theo spec §6.2 (contracts/api.md §5 + tasks T075):
 * routes → routes + sitemap + listing + layout; articles/pages → chi tiết + listing + sitemap;
 * company → company (+ layout); pricing → pricing; redirects → redirects.
 */
export const COLLECTION_TAGS: Record<RevalidateCollection, string[]> = {
  routes: ["routes", "sitemap", "listing", "layout"],
  articles: ["articles", "sitemap"],
  pages: ["pages", "sitemap"],
  company_settings: ["company", "layout"],
  pricing_settings: ["pricing", "layout"],
  airport_pricing: ["pricing"],
  distance_rates: ["pricing"],
  redirects: ["redirects"],
};

/** Path chi tiết theo collection (§5.5 DETAIL_PATH). */
export const DETAIL_BASE_PATH: Partial<Record<RevalidateCollection, string>> = {
  routes: "/tuyen-lien-tinh",
  articles: "/tin-tuc",
};

/** Collection cần làm mới layout gốc (§5.5: routes/company_settings/pricing_settings). */
const LAYOUT_COLLECTIONS: RevalidateCollection[] = ["routes", "company_settings", "pricing_settings"];

export type RevalidatePathEntry = { path: string; type?: "layout" | "page" };
export type RevalidationPlan = { tags: string[]; paths: RevalidatePathEntry[] };

/** So sánh timing-safe (không lộ độ dài qua timing khi đủ dài). */
export function safeSecretEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(String(provided ?? ""), "utf8");
  const b = Buffer.from(String(expected ?? ""), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function toSlugOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * Parse body webhook: hỗ trợ `collection` (hợp đồng backend) và `global` (Payload global).
 * Trả null khi không nhận diện được payload.
 */
export function parseRevalidatePayload(raw: unknown): RevalidatePayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;

  const rawCollection = typeof body.collection === "string" ? body.collection : typeof body.global === "string" ? body.global : "";
  const collection = REVALIDATE_COLLECTIONS.find((item) => item === rawCollection);
  if (!collection) return null;

  const action = typeof body.action === "string" && body.action.trim() !== "" ? body.action.trim() : null;

  return {
    collection,
    slug: toSlugOrNull(body.slug),
    previousSlug: toSlugOrNull(body.previousSlug),
    action,
  };
}

/** Lập kế hoạch revalidateTag/revalidatePath theo bảng §6.2. */
export function buildRevalidationPlan(payload: RevalidatePayload): RevalidationPlan {
  const tags = [...COLLECTION_TAGS[payload.collection]];
  const paths: RevalidatePathEntry[] = [];
  const slugs = [payload.slug, payload.previousSlug].filter((s): s is string => Boolean(s));

  const base = DETAIL_BASE_PATH[payload.collection];
  if (base) {
    for (const slug of slugs) paths.push({ path: `${base}/${slug}` });
    paths.push({ path: base });
  }

  if (LAYOUT_COLLECTIONS.includes(payload.collection)) {
    paths.push({ path: "/", type: "layout" });
  }

  return { tags, paths };
}
