import { resolveProductImageUrl } from "@/entities/product/lib/resolveProductImageUrl";

import type { PriceOfferProductPreview } from "../api/incomingPriceOffersApi";

export const resolvePriceOfferProductImageUrl = (
  product: PriceOfferProductPreview | null | undefined,
): string | null => {
  const url = resolveProductImageUrl(product);
  return url || null;
};
