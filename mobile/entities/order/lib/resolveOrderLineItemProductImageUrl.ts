import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "@/entities/product/model/constants";

export const resolveOrderLineItemProductImageUrl = (item: unknown): string => {
  const populated = (item as { productId?: unknown }).productId;
  if (populated == null || typeof populated !== "object") {
    return PRODUCT_IMAGE_PLACEHOLDER_URL;
  }

  const urls = resolveProductImageUrls(populated);
  return urls[0] ?? PRODUCT_IMAGE_PLACEHOLDER_URL;
};
