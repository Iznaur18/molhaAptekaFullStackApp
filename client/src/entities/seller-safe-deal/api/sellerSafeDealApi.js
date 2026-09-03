import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @param {unknown} e */
const toMessage = (e) =>
  e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.INVALID_SERVER_RESPONSE;

/**
 * `GET /sellers/safe-deal/me` — статус собственной заявки.
 *
 * @returns {Promise<import("../model/types.js").SellerSafeDeal>}
 */
export async function fetchMySellerSafeDeal() {
  try {
    const { data } = await apiClient.get("/sellers/safe-deal/me");
    if (!data?.success || !data.data?.safeDeal) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.safeDeal;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `POST /sellers/safe-deal/application` — подать или переподать заявку.
 *
 * @param {{ legalForm: string; inn: string }} payload
 * @returns {Promise<import("../model/types.js").SellerSafeDeal>}
 */
export async function submitSellerSafeDealApplication(payload) {
  try {
    const { data } = await apiClient.post("/sellers/safe-deal/application", payload);
    if (!data?.success || !data.data?.safeDeal) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.safeDeal;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `GET /staff/safe-deal` — очередь модерации.
 *
 * @param {{ status?: string; page?: number; limit?: number }} [params]
 */
export async function fetchSafeDealApplications(params = {}) {
  try {
    const { data } = await apiClient.get("/staff/safe-deal", { params });
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `PATCH /staff/safe-deal/:userId/moderation` — решение модератора.
 *
 * @param {{ userId: string; nextStatus: string; comment?: string }} payload
 */
export async function reviewSafeDealApplication({ userId, nextStatus, comment = "" }) {
  try {
    const { data } = await apiClient.patch(`/staff/safe-deal/${userId}/moderation`, {
      nextStatus,
      comment,
    });
    if (!data?.success || !data.data?.safeDeal) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.safeDeal;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
