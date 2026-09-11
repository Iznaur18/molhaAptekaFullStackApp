import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Сколько id можно запросить за раз (корзина + запас). */
export const CATALOG_PRODUCTS_BY_IDS_MAX = 100;

/**
 * `GET /product/catalog-by-ids?ids=a,b,c`
 * ids — через запятую или повтор query (`ids=a&ids=b`).
 */
export const catalogProductsByIdsQuerySchema = z.object({
  ids: z.preprocess((value) => {
    if (Array.isArray(value)) {
      return value
        .flatMap((row) => String(row ?? "").split(","))
        .map((row) => row.trim())
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((row) => row.trim())
        .filter(Boolean);
    }
    return [];
  }, z.array(mongoIdSchema).max(CATALOG_PRODUCTS_BY_IDS_MAX)),
});
