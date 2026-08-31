import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @param {unknown} e */
const toMessage = (e) =>
  e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.INVALID_SERVER_RESPONSE;

/**
 * `GET /couriers/me` — статус собственной заявки курьера.
 *
 * @returns {Promise<import("../model/types.js").CourierProfile>}
 */
export async function fetchMyCourierProfile() {
  try {
    const { data } = await apiClient.get("/couriers/me");
    if (!data?.success || !data.data?.courier) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.courier;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `POST /couriers/application` — подать или переподать заявку.
 *
 * @param {{ vehicleMake: string; vehicleColor: string; vehiclePlate: string }} payload
 * @returns {Promise<import("../model/types.js").CourierProfile>}
 */
export async function submitCourierApplication(payload) {
  try {
    const { data } = await apiClient.post("/couriers/application", payload);
    if (!data?.success || !data.data?.courier) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.courier;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `GET /staff/couriers` — очередь модерации.
 *
 * @param {{ status?: string; page?: number; limit?: number }} [params]
 */
export async function fetchCourierApplications(params = {}) {
  try {
    const { data } = await apiClient.get("/staff/couriers", { params });
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `PATCH /staff/couriers/:userId/moderation` — решение модератора.
 *
 * @param {{ userId: string; nextStatus: "approved" | "rejected"; comment?: string }} payload
 */
export async function reviewCourierApplication({ userId, nextStatus, comment = "" }) {
  try {
    const { data } = await apiClient.patch(
      `/staff/couriers/${userId}/moderation`,
      { nextStatus, comment },
    );
    if (!data?.success || !data.data?.courier) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.courier;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
