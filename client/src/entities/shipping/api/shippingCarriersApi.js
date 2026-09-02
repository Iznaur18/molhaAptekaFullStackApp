import { apiClient } from "../../../shared/api/index.js";

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
