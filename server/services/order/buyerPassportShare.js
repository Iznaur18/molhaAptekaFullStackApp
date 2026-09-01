import { ORDER_STATUS_CANCELLED } from "../../constants/orderConstants.js";
import { PASSPORT_VAULT_ACCESS_PURPOSE_INSTALLMENT_SNAPSHOT } from "../../constants/passportVaultConstants.js";
import { USER_DATA_CONFIRMATION_STATUS_APPROVED } from "../../constants/userDataConfirmationConstants.js";
import { UserDataConfirmationRequestModel } from "../../models/index.js";
import {
  openPassportStored,
  recordPassportVaultAccess,
  sealPassportPlain,
} from "../passport-vault/index.js";
import { maskPassportForBuyerApi } from "../user/maskPassportForApi.js";
import { stripShipmentCodes } from "./sanitizeShipmentCodes.js";

/**
 * @param {unknown} value
 */
const toPlainOrder = (value) => {
  if (value == null) {
    return null;
  }
  if (typeof value.toObject === "function") {
    return value.toObject();
  }
  return { ...value };
};

/**
 * @param {Record<string, unknown> | null | undefined} order
 */
export const isOrderCancelledForPassportShare = (order) => {
  if (!order) {
    return true;
  }
  if (order.status === ORDER_STATUS_CANCELLED) {
    return true;
  }
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    items.length > 0 && items.every((item) => item?.status === ORDER_STATUS_CANCELLED)
  );
};

/**
 * Approved passport snapshot for installment consent flow (sealed for Mongo).
 *
 * @param {string} buyerUserId
 * @returns {Promise<{
 *   passport: Record<string, unknown>;
 *   passportSelfiePhotoUrl: string;
 * } | null>}
 */
export async function loadApprovedBuyerPassportShareSnapshot(buyerUserId) {
  const row = await UserDataConfirmationRequestModel.findOne({
    userId: buyerUserId,
    status: USER_DATA_CONFIRMATION_STATUS_APPROVED,
  })
    .sort({ reviewedAt: -1, updatedAt: -1 })
    .select("passport passportSelfiePhotoUrl")
    .lean();

  if (!row?.passport || !row.passportSelfiePhotoUrl) {
    return null;
  }

  const passportPlain = openPassportStored(row.passport);
  if (!passportPlain) {
    return null;
  }

  await recordPassportVaultAccess({
    actorUserId: buyerUserId,
    purpose: PASSPORT_VAULT_ACCESS_PURPOSE_INSTALLMENT_SNAPSHOT,
    resourceType: "UserDataConfirmationRequest",
    resourceId: String(row._id),
  });

  return {
    passport: sealPassportPlain(passportPlain),
    passportSelfiePhotoUrl: String(row.passportSelfiePhotoUrl).trim(),
  };
}

/**
 * Seller-facing payload (masked series/number, like staff). Null if cancelled or missing.
 *
 * @param {Record<string, unknown> | null | undefined} order
 */
export const resolveSellerBuyerPassportShare = (order) => {
  if (!order || isOrderCancelledForPassportShare(order)) {
    return null;
  }

  const share = order.buyerPassportShare;
  if (!share || typeof share !== "object" || !share.passport) {
    return null;
  }

  const selfieUrl = String(share.passportSelfiePhotoUrl ?? "").trim();
  if (!selfieUrl) {
    return null;
  }

  const passportPlain = openPassportStored(share.passport);
  if (!passportPlain) {
    return null;
  }

  return {
    passport: maskPassportForBuyerApi(passportPlain),
    passportSelfiePhotoUrl: selfieUrl,
    consentAt: order.passportShareConsentAt ?? null,
  };
};

/**
 * @param {unknown} order
 */
export const sanitizeOrderForBuyerApi = (order) => {
  const plain = toPlainOrder(order);
  if (!plain) {
    return plain;
  }
  delete plain.buyerPassportShare;
  delete plain.passportShareConsentAt;
  return stripShipmentCodes(plain, "buyer");
};

/**
 * Курьеру — ни кодов, ни реквизитов, ни паспорта.
 *
 * Раньше курьерские ручки отвечали покупательской чисткой, и на шаге
 * «Привёз» курьер получал в ответе код вручения. Тогда `/complete` он мог
 * вызвать сам, без покупателя, — второе рукопожатие переставало что-либо
 * доказывать.
 *
 * @param {unknown} order
 */
export const sanitizeOrderForCourierApi = (order) => {
  const plain = toPlainOrder(order);
  if (!plain) {
    return plain;
  }
  delete plain.buyerPassportShare;
  delete plain.passportShareConsentAt;
  return stripShipmentCodes(plain, "courier");
};

/**
 * @param {unknown} order
 */
export const sanitizeOrderForSellerApi = (order) => {
  const plain = toPlainOrder(order);
  if (!plain) {
    return plain;
  }
  const buyerPassportShare = resolveSellerBuyerPassportShare(plain);
  delete plain.buyerPassportShare;
  plain.buyerPassportShare = buyerPassportShare;
  return stripShipmentCodes(plain, "seller");
};

/**
 * Clears PII snapshot after cancel; keeps consent audit timestamp.
 *
 * @param {import('mongoose').Document} order
 */
export const clearBuyerPassportShareOnOrder = (order) => {
  if (!order) {
    return;
  }
  order.buyerPassportShare = null;
};

/**
 * @param {Array<{ orderId?: string | null }>} payloads
 * @param {Map<string, Record<string, unknown>>} orderById
 */
export const attachSellerBuyerPassportShareToContracts = (payloads, orderById) =>
  payloads.map((payload) => {
    const orderId = payload.orderId ? String(payload.orderId) : "";
    const order = orderId ? orderById.get(orderId) : null;
    return {
      ...payload,
      buyerPassportShare: resolveSellerBuyerPassportShare(order),
    };
  });
