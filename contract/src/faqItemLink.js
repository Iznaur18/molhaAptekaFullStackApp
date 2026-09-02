import { z } from "zod";

export const FAQ_ITEM_ID_MAX_LENGTH = 64;
export const FAQ_ITEM_LINK_HREF_MAX_LENGTH = 2048;

const FAQ_ITEM_ID_PATTERN = /^[a-z0-9-]+$/;

/** @param {string} value */
export const isAllowedFaqItemLinkHref = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.length > FAQ_ITEM_LINK_HREF_MAX_LENGTH) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return false;
  }

  return /^(https?:\/\/|mailto:|tel:|\/)/.test(trimmed);
};

export const faqItemIdParamsSchema = z.object({
  itemId: z
    .string()
    .trim()
    .min(1, "itemId обязателен")
    .max(FAQ_ITEM_ID_MAX_LENGTH, "itemId слишком длинный")
    .regex(FAQ_ITEM_ID_PATTERN, "Недопустимый itemId"),
});

export const faqItemLinkPatchBodySchema = z
  .object({
    href: z.union([z.string(), z.null()]).optional(),
    resetHref: z.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    if (body.resetHref === true && body.href !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "resetHref и href нельзя передавать вместе",
      });
      return;
    }

    if (body.href === undefined && body.resetHref !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите href или resetHref",
      });
      return;
    }

    if (typeof body.href === "string" && body.href.trim() !== "") {
      if (!isAllowedFaqItemLinkHref(body.href)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Недопустимый URL",
          path: ["href"],
        });
      }
    }
  });
