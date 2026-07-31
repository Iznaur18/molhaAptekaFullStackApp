import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 */
export async function fetchProductInstallmentProgram(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/installment-program`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.program ?? null;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить рассрочку";
    throw new Error(message);
  }
}

/**
 * @param {string} productId
 * @param {{ isEnabled: boolean; plans: Array<{ title: string; monthsCount: number; monthlyAmountRub: number; firstPaymentRequiredNow?: boolean }> }} body
 */
export async function upsertProductInstallmentProgram(productId, body) {
  try {
    const { data } = await apiClient.put(
      `/product/${productId}/installment-program`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось сохранить рассрочку";
    throw new Error(message);
  }
}

/**
 * @param {string} productId
 * @param {{
 *   planId: string;
 *   quantity: number;
 *   deliveryAddress: string;
 *   deliveryAddressFlat: string;
 *   paymentMethod: string;
 *   passportShareConsent: true;
 * }} body
 */
export async function createInstallmentContract(productId, body) {
  try {
    const { data } = await apiClient.post(
      `/product/${productId}/installment-contracts`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось оформить рассрочку";
    throw new Error(message);
  }
}

export async function fetchMyInstallmentContracts(params = {}) {
  try {
    const status = typeof params.status === "string" ? params.status.trim() : "";
    const { data } = await apiClient.get("/installment/contracts/my", {
      params: {
        page: 1,
        limit: 100,
        ...(status ? { status } : {}),
      },
    });
    if (!data?.success || !Array.isArray(data.data?.contracts)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.contracts;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить рассрочки";
    throw new Error(message);
  }
}

export async function fetchMyInstallmentSales(params = {}) {
  try {
    const status = typeof params.status === "string" ? params.status.trim() : "";
    const { data } = await apiClient.get("/installment/contracts/sales", {
      params: {
        page: 1,
        limit: 100,
        ...(status ? { status } : {}),
      },
    });
    if (!data?.success || !Array.isArray(data.data?.contracts)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.contracts;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить продажи в рассрочку";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {number} paymentIndex
 * @param {string} [idempotencyKey]
 */
export async function markInstallmentPaymentPaid(
  contractId,
  paymentIndex,
  idempotencyKey,
) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/mark-paid`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {number} paymentIndex
 * @param {string} [idempotencyKey]
 */
export async function rejectInstallmentPayment(
  contractId,
  paymentIndex,
  idempotencyKey,
) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/reject`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {number} paymentIndex
 * @param {string} [idempotencyKey]
 */
export async function confirmInstallmentPayment(
  contractId,
  paymentIndex,
  idempotencyKey,
) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/confirm`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} [idempotencyKey]
 */
export async function markInstallmentEarlyPayoff(contractId, idempotencyKey) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} [idempotencyKey]
 */
export async function rejectInstallmentEarlyPayoff(contractId, idempotencyKey) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/reject`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} [idempotencyKey]
 */
export async function cancelInstallmentEarlyPayoff(contractId, idempotencyKey) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/cancel`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} [idempotencyKey]
 */
export async function confirmInstallmentEarlyPayoff(contractId, idempotencyKey) {
  try {
    const body = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/confirm`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} messageText
 */
export async function sendInstallmentSellerMessage(contractId, messageText) {
  try {
    const { data } = await apiClient.post(
      `/installment/contracts/${contractId}/message`,
      { message: messageText },
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

/**
 * @param {string} contractId
 * @param {string} reason
 */
export async function openInstallmentDispute(contractId, reason) {
  try {
    const { data } = await apiClient.post(
      `/installment/contracts/${contractId}/dispute`,
      { reason },
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

export async function fetchPendingInstallmentDisputes() {
  try {
    const { data } = await apiClient.get("/installment/disputes/pending");
    if (!data?.success || !Array.isArray(data.data?.disputes)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.disputes;
  } catch (e) {
    const message = e?.response?.data?.message ?? e?.message ?? "Ошибка";
    throw new Error(message);
  }
}

export async function fetchPendingInstallmentDisputesCount() {
  try {
    const { data } = await apiClient.get("/installment/disputes/pending/count");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return Number(data.data?.count) || 0;
  } catch {
    return 0;
  }
}

export async function fetchInstallmentBuyerActionCount() {
  try {
    const { data } = await apiClient.get("/installment/contracts/my/action-count");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return Number(data.data?.count) || 0;
  } catch {
    return 0;
  }
}

export async function fetchInstallmentSellerActionCount() {
  try {
    const { data } = await apiClient.get("/installment/contracts/sales/action-count");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return Number(data.data?.count) || 0;
  } catch {
    return 0;
  }
}

/**
 * @param {string} disputeId
 * @param {{ action: string; resolutionNote?: string; partialRefundRub?: number }} body
 */
export async function resolveInstallmentDispute(disputeId, body) {
  const { data } = await apiClient.patch(
    `/installment/disputes/${disputeId}/resolve`,
    body,
  );
  if (!data?.success) {
    throw new Error(data?.message ?? "Ошибка");
  }
  return data.data;
}
