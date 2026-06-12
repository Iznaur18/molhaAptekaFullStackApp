import { resolveUploadedMediaUrl } from "@/shared/lib";

type ProductImageSource = {
  productImageUrls?: unknown;
  productImageUrl?: unknown;
};

export const resolveProductImageUrl = (product: unknown): string => {
  if (!product || typeof product !== "object") {
    return "";
  }

  const source = product as ProductImageSource;
  const fromArray = Array.isArray(source.productImageUrls) ? source.productImageUrls : [];
  for (const raw of fromArray) {
    const url = resolveUploadedMediaUrl(String(raw ?? ""));
    if (url) {
      return url;
    }
  }

  if (typeof source.productImageUrl === "string") {
    return resolveUploadedMediaUrl(source.productImageUrl);
  }

  return "";
};
