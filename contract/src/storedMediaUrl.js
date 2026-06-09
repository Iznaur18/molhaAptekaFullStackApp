import { z } from "zod";

const UPLOAD_ASSET_PATH_RE = /^\/uploads\/[^?#]+/i;

/**
 * @param {unknown} value
 */
export function isStoredMediaUrl(value) {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (UPLOAD_ASSET_PATH_RE.test(trimmed)) {
    return true;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export const storedMediaUrlSchema = z
  .string()
  .trim()
  .min(1)
  .superRefine((value, ctx) => {
    if (!isStoredMediaUrl(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL должен быть http(s):// или путь /uploads/...",
      });
    }
  });

export const storedMediaUrlOrEmptySchema = z.union([
  storedMediaUrlSchema,
  z.literal(""),
]);
