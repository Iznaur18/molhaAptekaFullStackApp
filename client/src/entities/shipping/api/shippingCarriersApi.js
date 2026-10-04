import { shippingCarrierInfoListDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { SHIPPING_CARRIER_INFO_UI } from "../../../shared/config/appUiCopy.js";

/** `GET /order/shipping-carriers` — что сейчас можно выбрать. */
export async function fetchShippingCarriers() {
  const { data } = await apiClient.get("/order/shipping-carriers");
  return data?.data?.carriers ?? [];
}

/** `GET /staff/shipping-carriers` — полная картина для админа. */
export async function fetchStaffShippingCarriers() {
  const { data } = await apiClient.get("/staff/shipping-carriers");
  return data?.data?.carriers ?? [];
}

/** `PATCH /staff/shipping-carriers/:carrierId` */
export async function toggleShippingCarrier({ carrierId, enabled }) {
  const { data } = await apiClient.patch(`/staff/shipping-carriers/${carrierId}`, {
    enabled,
  });
  return data?.data?.carriers ?? [];
}

/** `GET /order/shipping-carriers/info` — справки по службам для кнопки «!». */
export async function fetchShippingCarrierInfo() {
  try {
    const { data } = await apiClient.get("/order/shipping-carriers/info");
    return parseApiContractData(data, shippingCarrierInfoListDataSchema).items;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ?? SHIPPING_CARRIER_INFO_UI.FETCH_FALLBACK,
    );
  }
}

/** `GET /staff/shipping-carriers/info` — все службы, включая незаполненные. */
export async function fetchStaffShippingCarrierInfo() {
  try {
    const { data } = await apiClient.get("/staff/shipping-carriers/info");
    return parseApiContractData(data, shippingCarrierInfoListDataSchema).items;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ?? SHIPPING_CARRIER_INFO_UI.FETCH_FALLBACK,
    );
  }
}

/** `PUT /staff/shipping-carriers/:carrierId/info` */
export async function saveShippingCarrierInfo({ carrierId, info }) {
  try {
    const { data } = await apiClient.put(
      `/staff/shipping-carriers/${carrierId}/info`,
      info,
    );
    return parseApiContractData(data, shippingCarrierInfoListDataSchema).items;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ?? SHIPPING_CARRIER_INFO_UI.SAVE_FALLBACK,
    );
  }
}
