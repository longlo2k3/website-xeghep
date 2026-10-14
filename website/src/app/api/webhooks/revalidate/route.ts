import { revalidatePath, revalidateTag } from "next/cache";

import {
  REVALIDATE_SECRET_HEADER,
  buildRevalidationPlan,
  parseRevalidatePayload,
  safeSecretEqual,
} from "../../../../lib/revalidate";

export const dynamic = "force-dynamic";

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/**
 * Webhook revalidate phía frontend (spec §5.5/§6.2).
 * Backend gửi POST {collection, slug, previousSlug, action} kèm header x-revalidate-secret.
 */
export async function POST(request: Request): Promise<Response> {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  const provided = request.headers.get(REVALIDATE_SECRET_HEADER) ?? "";
  if (!expected || !safeSecretEqual(provided, expected)) {
    return json({ revalidated: false, error: "unauthorized" }, 401);
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const payload = parseRevalidatePayload(body);
  if (!payload) {
    return json({ revalidated: false, error: "invalid payload" }, 422);
  }

  const plan = buildRevalidationPlan(payload);
  for (const tag of plan.tags) revalidateTag(tag);
  for (const entry of plan.paths) {
    if (entry.type === "layout") revalidatePath(entry.path, "layout");
    else revalidatePath(entry.path);
  }

  return json({ revalidated: true, tags: plan.tags, now: new Date().toISOString() }, 200);
}
