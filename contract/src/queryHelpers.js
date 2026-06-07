import { z } from "zod";

export const optionalPageQuery = z.coerce.number().int().min(1).optional().default(1);

export const optionalLimitQuery = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .default(10);

export const optionalTrimmedString = z.preprocess((value) => {
  if (value == null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());
