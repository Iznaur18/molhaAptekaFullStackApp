import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

export const SELLER_SHELF_NAME_MAX_CHARS = 30;
export const SELLER_SHELF_MAX_PER_SELLER = 10;

export const sellerShelfIdParamsSchema = z.object({
  shelfId: mongoIdSchema,
});

export const sellerShelfSellerIdParamsSchema = z.object({
  sellerId: mongoIdSchema,
});

export const createSellerShelfBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(SELLER_SHELF_NAME_MAX_CHARS),
});

export const patchSellerShelfBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(SELLER_SHELF_NAME_MAX_CHARS)
      .optional(),
    sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
  })
  .refine((body) => body.name != null || body.sortOrder != null, {
    message: "Нужно передать name и/или sortOrder",
  });

export const reorderSellerShelvesBodySchema = z.object({
  orderedShelfIds: z.array(mongoIdSchema).min(1).max(SELLER_SHELF_MAX_PER_SELLER),
});

export const setSellerShelfProductsBodySchema = z.object({
  productIds: z.array(mongoIdSchema).max(500),
});

export const sellerShelfSchema = z.object({
  _id: z.string(),
  sellerId: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
  productCount: z.number().int().nonnegative(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const sellerShelfListDataSchema = z.object({
  shelves: z.array(sellerShelfSchema),
  maxShelves: z.number().int(),
  nameMaxChars: z.number().int(),
});
