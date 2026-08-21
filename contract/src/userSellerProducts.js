import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { paginationSchema } from "./pagination.js";
import { productFromApiSchema } from "./productFromApi.js";

/** Query `GET /user/:userId/products`. */
export const userSellerProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
  shelfId: mongoIdSchema.optional(),
});

export const userSellerProductThumbItemSchema = z
  .object({
    productId: z.string(),
    productName: z.string(),
    viewable: z.boolean(),
    product: productFromApiSchema.nullable().optional(),
  })
  .passthrough();

export const userSellerProductsPageDataSchema = z.object({
  items: z.array(userSellerProductThumbItemSchema),
  pagination: paginationSchema,
});
