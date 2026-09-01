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

/** @param {string} path @param {object} [body] */
async function postCourierAction(path, body) {
  try {
    const { data } = await apiClient.post(path, body);
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/** `GET /couriers/overview` — свободные отправления в регионе курьера. */
export async function fetchCourierOverview({ lat = null, lon = null } = {}) {
  try {
    const params = {};
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      params.lat = lat;
      params.lon = lon;
    }
    const { data } = await apiClient.get("/couriers/overview", { params });
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/** `GET /couriers/my-deliveries` — активные доставки курьера. */
export async function fetchMyCourierDeliveries() {
  try {
    const { data } = await apiClient.get("/couriers/my-deliveries");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

const shipmentBase = (orderId, sellerId) =>
  `/couriers/shipments/${orderId}/${sellerId}`;

/** @param {{ orderId: string; sellerId: string }} ids */
export const acceptCourierShipment = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/accept`);

/** Продавец выдаёт код передачи — ответ содержит четыре цифры. */
export const issueHandoverCode = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/handover-code`);

export const confirmCourierHandover = ({ orderId, sellerId, code }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/handover`, { code });

export const setShipmentPaymentConfirmed = ({ orderId, sellerId, confirmed = true }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/payment-confirmed`, {
    confirmed,
  });

export const replaceShipmentCourier = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/replace-courier`);

export const startCourierDelivery = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/start-delivery`);

export const markCourierArrived = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/arrived`);

export const completeCourierDelivery = ({ orderId, sellerId, code }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/complete`, { code });

/** Курьер снимает с себя заявку, пока товар ещё у продавца. */
export const declineCourierShipment = ({ orderId, sellerId }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/decline`);

/** Товар у курьера, а курьер пропал: спор открывает продавец или покупатель. */
export const openShipmentDispute = ({ orderId, sellerId, reason = "" }) =>
  postCourierAction(`${shipmentBase(orderId, sellerId)}/open-dispute`, { reason });

/** `GET /staff/shipment-disputes` — очередь модератора. */
export async function fetchShipmentDisputes() {
  try {
    const { data } = await apiClient.get("/staff/shipment-disputes");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

/** `POST /staff/shipment-disputes/:orderId/:sellerId/resolve` — решение модератора. */
export const resolveShipmentDispute = ({ orderId, sellerId, outcome }) =>
  postCourierAction(`/staff/shipment-disputes/${orderId}/${sellerId}/resolve`, {
    outcome,
  });

/** `PATCH /order/:orderId/shipment/:sellerId/delivery-fee` — покупатель поднимает сумму. */
export async function raiseShipmentDeliveryFee({ orderId, sellerId, deliveryFeeRub }) {
  try {
    const { data } = await apiClient.patch(
      `/order/${orderId}/shipment/${sellerId}/delivery-fee`,
      { deliveryFeeRub },
    );
    if (!data?.success || !data.data?.order) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}
