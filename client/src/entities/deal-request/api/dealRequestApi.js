import {
  dealRequestDataSchema,
  dealRequestSellerContactDataSchema,
  myDealRequestsDataSchema,
} from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import {
  DEAL_REQUESTS_PAGE_UI,
  PRODUCT_DEAL_ACTIONS_UI,
} from "../../../shared/config/appUiCopy.js";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function readApiError(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

/**
 * @param {{ role: "buyer" | "seller"; page: number; limit: number }} params
 */
export async function fetchMyDealRequests({ role, page, limit }) {
  try {
    const { data } = await apiClient.get("/deal-requests/me", {
      params: { role, page, limit },
    });
    return parseApiContractData(data, myDealRequestsDataSchema);
  } catch (error) {
    throw new Error(readApiError(error, DEAL_REQUESTS_PAGE_UI.LOAD_FALLBACK_ERROR));
  }
}

/**
 * @param {{ productId: string; preferredAt: string; comment?: string; address?: string }} body
 */
export async function createDealRequest(body) {
  try {
    const { data } = await apiClient.post("/deal-requests", body);
    return parseApiContractData(data, dealRequestDataSchema).request;
  } catch (error) {
    throw new Error(readApiError(error, PRODUCT_DEAL_ACTIONS_UI.SUBMIT_FALLBACK_ERROR));
  }
}

/**
 * Действие над заявкой: accept, decline, cancel, confirm или outcome.
 *
 * @param {{ requestId: string; action: string; body?: Record<string, unknown> }} params
 */
export async function postDealRequestAction({ requestId, action, body = {} }) {
  try {
    const { data } = await apiClient.post(
      `/deal-requests/${encodeURIComponent(requestId)}/${action}`,
      body,
    );
    return parseApiContractData(data, dealRequestDataSchema).request;
  } catch (error) {
    throw new Error(readApiError(error, DEAL_REQUESTS_PAGE_UI.ACTION_FALLBACK_ERROR));
  }
}

/**
 * @param {string} productId
 * @returns {Promise<string | null>}
 */
export async function fetchDealRequestSellerPhone(productId) {
  try {
    const { data } = await apiClient.get(
      `/deal-requests/seller-contact/${encodeURIComponent(productId)}`,
    );
    return parseApiContractData(data, dealRequestSellerContactDataSchema).phone;
  } catch (error) {
    throw new Error(readApiError(error, PRODUCT_DEAL_ACTIONS_UI.PHONE_FALLBACK_ERROR));
  }
}
