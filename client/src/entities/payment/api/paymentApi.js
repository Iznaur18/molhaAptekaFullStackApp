import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** @param {unknown} e */
const toMessage = (e) =>
  e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.INVALID_SERVER_RESPONSE;

/**
 * `GET /payments/config` — включена ли оплата картой.
 *
 * @returns {Promise<{ cardPaymentEnabled: boolean }>}
 */
export async function fetchPaymentConfig() {
  try {
    const { data } = await apiClient.get("/payments/config");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `POST /payments/loyalty-points` — создать платёж на пополнение баллов.
 *
 * @param {{ amountRub: number; returnUrl: string; idempotencyKey?: string }} payload
 * @returns {Promise<{ paymentId: string; confirmationUrl: string; amountRub: number }>}
 */
export async function createLoyaltyPointsPayment(payload) {
  try {
    const { data } = await apiClient.post("/payments/loyalty-points", payload);
    if (!data?.success || !data.data?.payment) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.payment;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/**
 * `GET /payments/:paymentId` — статус своего платежа после возврата с оплаты.
 *
 * @param {string} paymentId
 */
export async function fetchMyPayment(paymentId) {
  try {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.payment ?? null;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
