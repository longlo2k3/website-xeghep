import { describe, expect, it } from "vitest";

import {
  buildRevalidateBody,
  fireAndForgetRevalidate,
  resolveAfterChangeAction,
  resolveRevalidateBaseUrl,
  sendRevalidateEvent,
  toSlugOrNull,
} from "../src/lib/revalidate/webhookClient";

describe("toSlugOrNull", () => {
  it("chuỗi rỗng/không phải string → null", () => {
    expect(toSlugOrNull("")).toBeNull();
    expect(toSlugOrNull("   ")).toBeNull();
    expect(toSlugOrNull(undefined)).toBeNull();
    expect(toSlugOrNull(123)).toBeNull();
    expect(toSlugOrNull("cai-moi")).toBe("cai-moi");
  });
});

describe("resolveAfterChangeAction (spec 5.5)", () => {
  it("operation create → create", () => {
    expect(resolveAfterChangeAction({ doc: { slug: "a" }, operation: "create" })).toBe("create");
  });

  it("draft → published → publish; published → draft → unpublish", () => {
    expect(
      resolveAfterChangeAction({
        doc: { slug: "a", status: "published" },
        operation: "update",
        previousDoc: { slug: "a", status: "draft" },
      }),
    ).toBe("publish");
    expect(
      resolveAfterChangeAction({
        doc: { slug: "a", status: "draft" },
        operation: "update",
        previousDoc: { slug: "a", status: "published" },
      }),
    ).toBe("unpublish");
  });

  it("đổi slug khi published → update (kèm previousSlug ở body)", () => {
    expect(
      resolveAfterChangeAction({
        doc: { slug: "moi", status: "published" },
        operation: "update",
        previousDoc: { slug: "cu", status: "published" },
      }),
    ).toBe("update");
  });

  it("global không có status → update", () => {
    expect(
      resolveAfterChangeAction({
        doc: { identity: {} },
        operation: "update",
        previousDoc: { identity: {} },
      }),
    ).toBe("update");
  });
});

describe("buildRevalidateBody", () => {
  it("đúng hợp đồng §5.5: collection, slug, previousSlug, action", () => {
    expect(
      buildRevalidateBody({
        action: "update",
        collection: "routes",
        previousSlug: "cu",
        slug: "moi",
      }),
    ).toEqual({
      action: "update",
      collection: "routes",
      previousSlug: "cu",
      slug: "moi",
    });
  });

  it("slug/previousSlug thiếu → null (không phải undefined)", () => {
    expect(buildRevalidateBody({ action: "update", collection: "company_settings" })).toEqual({
      action: "update",
      collection: "company_settings",
      previousSlug: null,
      slug: null,
    });
  });
});

describe("resolveRevalidateBaseUrl", () => {
  it("ưu tiên REVALIDATE_URL, bỏ '/' cuối", () => {
    expect(
      resolveRevalidateBaseUrl({
        FRONTEND_URL: "http://a",
        REVALIDATE_URL: "https://site.example/",
      }),
    ).toBe("https://site.example");
  });

  it("fallback FRONTEND_URL; cả hai rỗng → null", () => {
    expect(resolveRevalidateBaseUrl({ FRONTEND_URL: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(resolveRevalidateBaseUrl({})).toBeNull();
  });
});

describe("sendRevalidateEvent", () => {
  const event = { action: "update" as const, collection: "pages" as const, slug: "home" };

  it("thiếu secret → ok:false, không gọi fetch", async () => {
    let called = false;
    const result = await sendRevalidateEvent(event, {
      env: { REVALIDATE_URL: "http://site" },
      fetchFn: (async () => {
        called = true;
        return new Response("{}");
      }) as typeof fetch,
    });
    expect(result.ok).toBe(false);
    expect(called).toBe(false);
  });

  it("HTTP 200 → ok:true kèm status", async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    const result = await sendRevalidateEvent(event, {
      env: { REVALIDATE_SECRET: "s3cret", REVALIDATE_URL: "http://site" },
      fetchFn: (async (url: string, init?: RequestInit) => {
        seen.url = url;
        seen.init = init;
        return new Response("{}", { status: 200 });
      }) as typeof fetch,
    });
    expect(result).toEqual({ ok: true, status: 200 });
    expect(seen.url).toBe("http://site/api/v1/webhooks/revalidate");
    expect(seen.init?.method).toBe("POST");
    const headers = seen.init?.headers as Record<string, string>;
    expect(headers["x-revalidate-secret"]).toBe("s3cret");
    expect(JSON.parse(String(seen.init?.body))).toEqual({
      action: "update",
      collection: "pages",
      previousSlug: null,
      slug: "home",
    });
  });

  it("fetch ném lỗi (timeout) → ok:false, không ném ra ngoài", async () => {
    const result = await sendRevalidateEvent(event, {
      env: { REVALIDATE_SECRET: "s", REVALIDATE_URL: "http://site" },
      fetchFn: (async () => {
        throw new Error("timeout");
      }) as typeof fetch,
    });
    expect(result.ok).toBe(false);
  });
});

describe("fireAndForgetRevalidate", () => {
  it("không throw kể cả khi webhook fail", () => {
    expect(() =>
      fireAndForgetRevalidate({ action: "delete", collection: "redirects", slug: "/a" }),
    ).not.toThrow();
  });
});
