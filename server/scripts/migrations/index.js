import { up as backfillOrderItemsStatusUp } from "./20260508-order-items-status.js";
import { up as productImageUrlsUp } from "./20260513-product-image-urls.js";

export const MIGRATIONS = [
  {
    id: "20260508-order-items-status",
    description: "Backfill item-level status/audit fields in orders",
    up: backfillOrderItemsStatusUp,
  },
  {
    id: "20260513-product-image-urls",
    description: "Migrate productImageUrl to productImageUrls array",
    up: productImageUrlsUp,
  },
];
