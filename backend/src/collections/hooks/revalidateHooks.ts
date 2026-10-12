import {
  fireAndForgetRevalidate,
  resolveAfterChangeAction,
  toSlugOrNull,
  type RevalidateCollection,
} from "../../lib/revalidate/webhookClient";

type HookDoc = Record<string, any> | null | undefined;

type RevalidateHookArgs = {
  doc?: HookDoc;
  operation?: string;
  previousDoc?: HookDoc;
};

type RevalidateDeleteHookArgs = { doc?: HookDoc };

export type RevalidateHooks = {
  afterChange: ((args: RevalidateHookArgs) => HookDoc)[];
  afterDelete: ((args: RevalidateDeleteHookArgs) => HookDoc)[];
};

const defaultSlug = (doc: HookDoc): string | null => toSlugOrNull(doc?.slug);

/** Getter slug theo tên field (vd redirects dùng `fromUrl`, distance_rates dùng `label`). */
export function toSlugGetter(field: string) {
  return (doc: HookDoc): string | null => toSlugOrNull(doc?.[field]);
}

/**
 * Hook factory T077: afterChange + afterDelete gửi webhook revalidate
 * (spec §5.5 + bảng 6.2). Fire-and-forget — lỗi không chặn admin, không await.
 *
 * @param collection slug collection/global theo hợp đồng (8 giá trị).
 * @param getSlug cách lấy slug từ doc (mặc định `doc.slug`; redirects dùng fromUrl,
 * distance_rates dùng label, globals dùng slug=null).
 */
export function revalidateCollectionHooks(
  collection: RevalidateCollection,
  getSlug: (doc: HookDoc) => string | null = defaultSlug,
): RevalidateHooks {
  return {
    afterChange: [
      ({ doc, previousDoc, operation }: RevalidateHookArgs) => {
        if (!doc) return doc;
        const slug = getSlug(doc);
        const previousSlug = getSlug(previousDoc);
        fireAndForgetRevalidate({
          action: resolveAfterChangeAction({ doc, operation, previousDoc }),
          collection,
          previousSlug: previousSlug !== slug ? previousSlug : null,
          slug,
        });
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }: RevalidateDeleteHookArgs) => {
        if (!doc) return doc;
        fireAndForgetRevalidate({
          action: "delete",
          collection,
          previousSlug: null,
          slug: getSlug(doc),
        });
        return doc;
      },
    ],
  };
}

/** Global (company_settings/pricing_settings) — không slug, mọi thay đổi là "update". */
export function revalidateGlobalHooks(
  collection: RevalidateCollection,
): Pick<RevalidateHooks, "afterChange"> {
  return {
    afterChange: [
      ({ doc }: RevalidateHookArgs) => {
        if (!doc) return doc;
        fireAndForgetRevalidate({ action: "update", collection, previousSlug: null, slug: null });
        return doc;
      },
    ],
  };
}
