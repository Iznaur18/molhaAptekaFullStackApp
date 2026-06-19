import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";

export const getUserProfileThumbSrc = (product: unknown): string | null => {
  const urls = resolveProductImageUrls(product);
  return urls[0] ?? null;
};
