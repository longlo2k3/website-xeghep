import { NextResponse, type NextRequest } from "next/server";

import { getRedirects, type RedirectEntry } from "@/lib/api";
import { resolveRedirect } from "@/lib/redirects";

const CACHE_MS = 60_000;
const FAILURE_BACKOFF_MS = 10_000;
const MIDDLEWARE_TIMEOUT_MS = 500;

let cache: { at: number; entries: RedirectEntry[] } | null = null;
let pending: Promise<RedirectEntry[]> | null = null;

/** Cache trong RAM 60s; CMS chết hoặc chậm → fail-open (không 500, không chặn tải trang). */
async function loadRedirects(): Promise<RedirectEntry[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.entries;
  if (pending) return pending;

  pending = (async () => {
    try {
      const entries = await getRedirects({ timeoutMs: MIDDLEWARE_TIMEOUT_MS });
      cache = { at: Date.now(), entries };
      return entries;
    } catch {
      // Fail-open: giữ dữ liệu cũ (nếu có) và tạm dừng gọi lại 10 giây.
      cache = { at: Date.now() - CACHE_MS + FAILURE_BACKOFF_MS, entries: cache?.entries ?? [] };
      return cache.entries;
    } finally {
      pending = null;
    }
  })();

  return pending;
}

export async function middleware(request: NextRequest): Promise<Response> {
  const entriesPromise = loadRedirects();
  const timeoutPromise = new Promise<RedirectEntry[]>((resolve) =>
    setTimeout(() => resolve(cache?.entries ?? []), MIDDLEWARE_TIMEOUT_MS),
  );

  const entries = await Promise.race([entriesPromise, timeoutPromise]);
  if (entries.length === 0) return NextResponse.next();

  const decision = resolveRedirect(request.nextUrl.pathname, entries, request.nextUrl.search);
  if (decision.type === "none") return NextResponse.next();
  if (decision.type === "gone") return new NextResponse(null, { status: 410 });

  return NextResponse.redirect(new URL(decision.location, request.url), decision.statusCode);
}

export const config = {
  matcher: ["/((?!_next|api|admin|media|favicon|robots|sitemap|.*\\..*).*)"],
};
