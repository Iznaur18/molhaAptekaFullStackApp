import { PRODUCT_IMAGE_URLS_MAX } from "@/entities/product/model/constants";
import { isDisplayableMediaUrl, resolveUploadedMediaUrl } from "@/shared/lib";

export const resolveProductImageUrls = (product: unknown): string[] => {
  if (!product || typeof product !== "object") {
    return [];
  }

  const source = product as {
    productImageUrls?: unknown;
    productImageUrl?: unknown;
  };

  const fromArray = Array.isArray(source.productImageUrls) ? source.productImageUrls : [];
  const cleaned = fromArray
    .map((value) => resolveUploadedMediaUrl(String(value ?? "").trim()))
    .filter((url) => isDisplayableMediaUrl(url))
    .slice(0, PRODUCT_IMAGE_URLS_MAX);

  if (cleaned.length > 0) {
    return cleaned;
  }

  if (typeof source.productImageUrl === "string" && source.productImageUrl.trim()) {
    const resolved = resolveUploadedMediaUrl(source.productImageUrl.trim());
    if (isDisplayableMediaUrl(resolved)) {
      return [resolved];
    }
  }

  return [];
};
