import assert from "node:assert/strict";

import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../../constants/orderConstants.js";
import { SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE } from "../../constants/productConstants.js";
import { UserModel } from "../../models/index.js";
import { seedProductCategoryTree } from "../../utils/seedProductCategoryTree.js";
import { buildCookieHeader } from "./httpTestApp.js";

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
 * @param {(path: string, init?: RequestInit) => Promise<Response>} request
 * @param {string} suffix
 */
export const registerUserAndGetCookie = async (request, suffix) => {
  const response = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRegisterPayload(suffix)),
  });
  assert.equal(response.status, 200);
  const cookie = buildCookieHeader(response.headers);
  const meData = await parseSuccessData(
    await request("/auth/me", { headers: { Cookie: cookie } }),
  );
  return { cookie, user: meData.user };
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
 * @param {string} userId
 */
export const confirmUserData = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, { isUserDataConfirmed: true });
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
});

export { SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE };
