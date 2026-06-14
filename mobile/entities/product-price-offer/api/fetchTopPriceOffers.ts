import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";

export type TopPriceOffer = {
  _id: string;
  offerPriceRub: number;
  buyerUserName?: string;
};

export const fetchTopPriceOffers = async (productId: string): Promise<TopPriceOffer[]> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers/top`);
    if (!data?.success || !Array.isArray(data.data?.offers)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.offers;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_TOP_PRICE_OFFERS_FALLBACK));
  }
};

export const formatOfferPrice = (price: number) => formatPriceRub(price);
