import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config as middlewareConfig, middleware } from "../src/middleware";

describe("T081 — admin security headers", () => {
  it("middleware set X-Robots-Tag: noindex, nofollow cho /admin", () => {
    const request = new NextRequest(new Request("http://localhost:3001/admin"));
    const response = middleware(request);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("middleware set header cho mọi route con của /admin", () => {
    const request = new NextRequest(
      new Request("http://localhost:3001/admin/collections/bookings"),
    );
    const response = middleware(request);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("matcher chỉ nhắm /admin — không chạm /api hay /media", () => {
    expect(middlewareConfig.matcher).toContain("/admin");
    expect(middlewareConfig.matcher).toContain("/admin/:path*");
    expect(middlewareConfig.matcher.join(",")).not.toMatch(/api|media/);
  });

  it("admin.meta khai báo robots noindex + branding (T083)", async () => {
    const payloadConfig = await (await import("../src/payload.config")).default;
    const meta = payloadConfig.admin.meta as Record<string, unknown>;
    expect(meta.robots).toBe("noindex, nofollow");
    expect(meta.title).toBe("Xe Ghép Liên Tỉnh — Quản trị");
    expect(meta.icons).toEqual({ icon: "/logo.svg" });
    expect(payloadConfig.admin.components?.graphics?.Logo).toBeTruthy();
  }, 60_000);
});
