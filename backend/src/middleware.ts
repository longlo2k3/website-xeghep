import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * T081 / FR-C06 — chặn lập chỉ mục khu quản trị `/admin/*` bằng header
 * `X-Robots-Tag: noindex, nofollow` (meta robots trong payload.config admin.meta
 * chỉ là lớp bổ sung; header mới là thứ crawler đọc khi fetch trang).
 *
 * Matcher giới hạn đúng `/admin` — KHÔNG chạm tới `/api/**`, `/media/**`.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
