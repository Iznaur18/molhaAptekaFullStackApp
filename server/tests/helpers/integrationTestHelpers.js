import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../../constants/orderConstants.js";
import { SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE } from "../../constants/productConstants.js";
import { USER_DATA_CONFIRMATION_STATUS_APPROVED } from "../../constants/userDataConfirmationConstants.js";
import {
  PendingRegistrationModel,
  UserDataConfirmationRequestModel,
  UserModel,
} from "../../models/index.js";
import { hashEmailVerificationSecret } from "../../services/auth/emailVerification.js";
import { seedProductCategoryTree } from "../../utils/seedProductCategoryTree.js";
import { buildCookieHeader } from "./httpTestApp.js";

/** Фиксированный код для confirm в интеграционных тестах (хеш пишется в PendingRegistration). */
export const TEST_REGISTRATION_CODE = "424242";

/** Идемпотентный seed пилотного дерева (нужен для POST /product с legacy productCategory). */
export const ensureProductCategoryTreeSeeded = async () => {
  await seedProductCategoryTree();
};

/**
 * @param {string} suffix
 */
export const buildRegisterPayload = (suffix) => {
  const safe = String(suffix)
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  return {
    email: `int-${suffix}@example.com`,
    password: "secret12",
    passwordConfirm: "secret12",
    userName: `intuser${safe}`,
  };
};

/**
 * @param {Record<string, unknown>} [overrides]
 */
export const buildTestProductPayload = (overrides = {}) => ({
  productName: "Integration Test Product",
  productDescription: "Product for integration tests",
  productImageUrls: ["https://example.com/product.jpg"],
  productPrice: 100,
  productCategory: "electronics",
  productIsAvailable: true,
  productStockQuantity: 5,
  productListingOrigin: "own",
  productIsOriginal: true,
  productRegionCode: "RU-MOW",
  productPickupAddress: "Москва, Тверская улица, д 1",
  productPickupLat: 55.757,
  productPickupLon: 37.615,
  productDeliveryEnabled: false,
  ...overrides,
});

/**
 * @param {Response} response
 */
export const parseSuccessData = async (response) => {
  const body = await response.json();
  assert.equal(body.success, true, JSON.stringify(body));
  return body.data;
};

/**
 * @param {Response} response
 */
export const parseErrorMessage = async (response) => {
  const body = await response.json();
  assert.ok(typeof body.message === "string", JSON.stringify(body));
  return body.message;
};

/**
 * @param {string} registrationId
 */
export const seedPendingRegistrationCode = async (registrationId) => {
  await PendingRegistrationModel.findByIdAndUpdate(registrationId, {
    codeHash: hashEmailVerificationSecret(TEST_REGISTRATION_CODE),
    codeAttemptCount: 0,
  });
};

import {
  AUTH_CLIENT_HEADER,
  AUTH_CLIENT_MOBILE,
} from "../../constants/authClientConstants.js";

/**
 * register → confirm (с тестовым кодом) → session + cookie.
 *
 * @param {(path: string, init?: RequestInit) => Promise<Response>} request
 * @param {Record<string, unknown>} payload
 * @param {{ includeMobileAuthClient?: boolean }} [options]
 */
export const completeRegistrationFlow = async (request, payload, options = {}) => {
  const registerResponse = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(registerResponse.status, 200, "register should succeed");
  const registerData = await parseSuccessData(registerResponse);
  assert.ok(registerData.registrationId, "registrationId required");

  await seedPendingRegistrationCode(registerData.registrationId);

  /** @type {Record<string, string>} */
  const confirmHeaders = { "Content-Type": "application/json" };
  if (options.includeMobileAuthClient) {
    confirmHeaders[AUTH_CLIENT_HEADER] = AUTH_CLIENT_MOBILE;
  }

  const confirmResponse = await request("/auth/register/confirm", {
    method: "POST",
    headers: confirmHeaders,
    body: JSON.stringify({
      registrationId: registerData.registrationId,
      code: TEST_REGISTRATION_CODE,
    }),
  });
  assert.equal(confirmResponse.status, 200, "confirm should succeed");
  const session = await parseSuccessData(confirmResponse);
  assert.equal(session.passwordHash, undefined);
  assert.equal(session.authTokenVersion, undefined);

  const cookie = buildCookieHeader(confirmResponse.headers);
  return { cookie, session, payload, confirmResponse };
};

/**
 * register → confirm → cookie сессии + /auth/me user.
 *
 * @param {(path: string, init?: RequestInit) => Promise<Response>} request
 * @param {string} suffix
 * @param {Record<string, unknown>} [payloadOverrides]
 */
export const registerUserAndGetCookie = async (
  request,
  suffix,
  payloadOverrides = {},
) => {
  const payload = { ...buildRegisterPayload(suffix), ...payloadOverrides };
  const { cookie, session } = await completeRegistrationFlow(request, payload);
  const meData = await parseSuccessData(
    await request("/auth/me", { headers: { Cookie: cookie } }),
  );
  return { cookie, user: meData.user, payload, session };
};

/**
 * @param {string} email
 */
export const verifyUserEmail = async (email) => {
  await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isEmailVerified: true },
  );
};

/**
 * Полное подтверждение данных: флаг на пользователе + approved-заявка с
 * паспортом и селфи (её требует передача паспорта продавцу при рассрочке,
 * см. loadApprovedBuyerPassportShareSnapshot).
 *
 * @param {string} userId
 */
export const confirmUserData = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, { isUserDataConfirmed: true });
  await UserDataConfirmationRequestModel.create({
    userId,
    status: USER_DATA_CONFIRMATION_STATUS_APPROVED,
    reviewedAt: new Date(),
    passport: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: "1990-01-01",
      series: "1234",
      number: "567890",
      issuedBy: "УФМС",
      departmentCode: "123-456",
      issuedAt: "2010-01-01",
    },
    passportSelfiePhotoUrl: "/uploads/selfie.jpg",
  });
};

/**
 * @param {string} userId
 */
export const enablePremiumUser = async (userId) => {
  const premiumExpiresAt = new Date();
  premiumExpiresAt.setFullYear(premiumExpiresAt.getFullYear() + 1);
  await UserModel.findByIdAndUpdate(userId, {
    isPremiumUser: true,
    premiumExpiresAt,
  });
};

/**
 * @param {string} userId
 * @param {'moderator' | 'admin'} role
 */
export const setUserRole = async (userId, role) => {
  await UserModel.findByIdAndUpdate(userId, { userRole: role });
};

/**
 * @param {string} userId
 * @param {number} points
 */
export const grantLoyaltyPoints = async (userId, points) => {
  await UserModel.findByIdAndUpdate(userId, {
    userLoyaltyPoints: points,
    userLoyaltyPointsReserved: 0,
  });
};

/**
 * @param {(path: string, init?: RequestInit) => Promise<Response>} request
 * @param {string} cookie
 * @param {Record<string, unknown>} [payloadOverrides]
 */
export const createProductViaApi = async (request, cookie, payloadOverrides = {}) => {
  const response = await request("/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(buildTestProductPayload(payloadOverrides)),
  });
  assertProductCreateOk(response.status);
  const data = await parseSuccessData(response);
  assert.ok(data.product?._id);
  return data.product;
};

/**
 * @param {(path: string, init?: RequestInit) => Promise<Response>} request
 * @param {string} moderatorCookie
 * @param {string} productId
 */
export const approveProductViaApi = async (request, moderatorCookie, productId) => {
  const response = await request(`/product/${productId}/moderation/approve`, {
    method: "PATCH",
    headers: { Cookie: moderatorCookie },
  });
  assert.equal(response.status, 200);
  return parseSuccessData(response);
};

/** POST /product возвращает 201 Created. */
export const assertProductCreateOk = (status) => {
  assert.ok(status === 200 || status === 201, `unexpected status ${status}`);
};

export const buildOrderBody = (productId, quantity = 1) => ({
  items: [{ productId: String(productId), quantity }],
  deliveryAddress: "Москва, Тверская 1",
  deliveryAddressFlat: "1",
  paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  idempotencyKey: randomUUID(),
});

export { SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE };
