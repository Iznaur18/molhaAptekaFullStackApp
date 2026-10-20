import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type {
  IncomingPriceOffer,
  PriceOfferBuyerPreview,
} from "./incomingPriceOffersApi";

/** Ставка по своему товару глазами продавца (паритет web `PriceOfferRow`). */
export type SellerProductPriceOffer = Omit<
  IncomingPriceOffer,
  "productId" | "buyer"
> & {
  productId?: string;
  updatedAt?: string;
  buyer?: PriceOfferBuyerPreview | string | null;
  buyerUserId?: PriceOfferBuyerPreview | string | null;
};

const readOffers = (payload: unknown): SellerProductPriceOffer[] => {
  const data = payload as { success?: boolean; data?: { offers?: unknown } } | null;
  if (!data?.success || !Array.isArray(data.data?.offers)) {
    throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  return data.data.offers as SellerProductPriceOffer[];
};

/** `GET /product/:productId/price-offers` — ставки по своему товару. */
export const fetchSellerProductPriceOffers = async (
  productId: string,
): Promise<SellerProductPriceOffer[]> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers`);
    return readOffers(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK),
    );
  }
};

/** `GET /product/:productId/price-offers/archive` — ставки прошедших аукционов. */
export const fetchSellerProductPriceOfferArchive = async (
  productId: string,
): Promise<SellerProductPriceOffer[]> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers/archive`);
    // Сервер отдаёт `{ success, data: { offers } }`, как и остальные ручки.
    return readOffers(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK),
    );
  }
};
