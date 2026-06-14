import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type MyPriceOffer = {
  _id: string;
  offerPrice?: number;
  status?: string;
  orderId?: string | null;
} | null;

export const fetchMyPriceOffer = async (productId: string): Promise<MyPriceOffer> => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/price-offers/me`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.offer ?? null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRICE_OFFER_FALLBACK));
  }
};

export const submitPriceOffer = async (productId: string, offerPrice: number) => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/price-offers`, {
      offerPrice,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.offer;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_PRICE_OFFER_FALLBACK));
  }
};

export const patchMyPriceOffer = async (productId: string, offerPrice: number) => {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/price-offers/me`, {
      offerPrice,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.offer;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_PRICE_OFFER_FALLBACK));
  }
};

export const cancelMyPriceOffer = async (productId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/${productId}/price-offers/me`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_PRICE_OFFER_FALLBACK));
  }
};
