import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type SellerDeliveryTariff = {
  paid: boolean;
  baseFeeRub: number;
  perKmRub: number;
  freeFromRub: number;
};

export type SellerCommercePickupLocation = {
  id?: string;
  label?: string;
  address: string;
  lat: number;
  lon: number;
  isDefault?: boolean;
};

export type SellerCommerceDefaults = {
  pickupLocations: SellerCommercePickupLocation[];
  pickupEnabled: boolean;
  deliveryCarrier: string;
  regionCode?: string;
  deliveryOutsideRegionEnabled?: boolean;
  deliveryTariff?: SellerDeliveryTariff | null;
  paymentMethods: string[];
  fulfillmentConfigured?: boolean;
  followingProductCount?: number;
  syncedProductCount?: number;
};

type CommerceDefaultsResponse = {
  success?: boolean;
  data?: { defaults?: SellerCommerceDefaults };
};

export type SaveSellerCommerceDefaultsPayload = {
  pickupLocations: SellerCommercePickupLocation[];
  pickupEnabled: boolean;
  deliveryCarrier: string;
  paymentMethods: string[];
  deliveryTariff?: SellerDeliveryTariff;
  deliveryOutsideRegionEnabled?: boolean;
  regionCode?: string;
};

export async function fetchMySellerCommerceDefaults(): Promise<SellerCommerceDefaults> {
  try {
    const { data } = await apiClient.get<CommerceDefaultsResponse>(
      "/sellers/commerce-defaults/me",
    );
    if (!data?.success || !data.data?.defaults) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.defaults;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.INVALID_SERVER_RESPONSE),
    );
  }
}

export async function saveMySellerCommerceDefaults(
  payload: SaveSellerCommerceDefaultsPayload,
): Promise<SellerCommerceDefaults> {
  try {
    const { data } = await apiClient.put<CommerceDefaultsResponse>(
      "/sellers/commerce-defaults",
      payload,
    );
    if (!data?.success || !data.data?.defaults) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.defaults;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.INVALID_SERVER_RESPONSE),
    );
  }
}
