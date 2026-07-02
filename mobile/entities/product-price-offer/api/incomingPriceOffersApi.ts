import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type PriceOfferProductPreview = {
  _id?: string;
  productName?: string;
  productImageUrls?: string[];
  productImageUrl?: string | null;
};

export type PriceOfferBuyerPreview = {
  _id?: string;
  userName?: string;
  isPremiumUser?: boolean;
  isUserDataConfirmed?: boolean;
};

export type IncomingPriceOffer = {
  _id: string;
  productId: string;
  offerPrice?: number;
  status?: string;
  createdAt?: string;
  product?: PriceOfferProductPreview;
  buyer?: PriceOfferBuyerPreview;
};

export type MyPriceOfferBid = {
  _id: string;
  productId: string;
  offerPrice?: number;
  status?: string;
  createdAt?: string;
  paymentDeadlineAt?: string;
  product?: PriceOfferProductPreview;
};

export const fetchIncomingPriceOffers = async (): Promise<IncomingPriceOffer[]> => {
  try {
    const { data } = await apiClient.get("/price-offers/incoming");
    if (!data?.success || !Array.isArray(data.data?.offers)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.offers;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_INCOMING_PRICE_OFFERS_FALLBACK),
    );
  }
};

export const fetchMyPriceOfferBids = async () => {
  try {
    const { data } = await apiClient.get("/price-offers/my-bids");
    if (!data?.success || !Array.isArray(data.data?.bids)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.bids as MyPriceOfferBid[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_PRICE_OFFER_BIDS_FALLBACK),
    );
  }
};

export const acceptPriceOffer = async (productId: string, offerId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/price-offers/${offerId}/accept`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.ACCEPT_PRICE_OFFER_FALLBACK));
  }
};

export const rejectPriceOffer = async (productId: string, offerId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/product/${productId}/price-offers/${offerId}/reject`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REJECT_PRICE_OFFER_FALLBACK));
  }
};
