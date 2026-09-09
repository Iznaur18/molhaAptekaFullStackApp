import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_SBP,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT,
} from "../constants/productPromotionConstants.js";
import { ProductModel, ProductPromotionModel, UserModel } from "../models/index.js";
import { requestProductPromotion } from "../services/product/productPromotion.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
  verifyUserEmail,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import("node:http").Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

const registerSeller = async (suffix) => {
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  return { cookie, user };
};

const approveProduct = async (productId) => {
  await ProductModel.updateOne(
    { _id: productId },
    {
      $set: {
        productModerationStatus: "approved",
        productIsAvailable: true,
        productStockQuantity: 5,
      },
    },
  );
};

test("оплата продвижения баллами сразу активирует и списывает LP", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie, user } = await registerSeller("promo-points");
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { userLoyaltyPoints: 5000, userLoyaltyPointsReserved: 0 } },
  );

  const product = await createProductViaApi(request, cookie, {
    productName: "Promo Points Product",
    productPrice: 10000,
  });
  await approveProduct(product._id);

  const response = await request(`/product/${product._id}/promotions/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      tier: 1,
      tariffCode: "24h",
      paymentMethod: "points",
      idempotencyKey: "promo-points-1",
    }),
  });
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);

  assert.equal(data.requiresPayment, false);
  assert.equal(data.promotion.status, PRODUCT_PROMOTION_STATUS_ACTIVE);
  assert.equal(data.promotion.paymentMethod, PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS);
  assert.ok(data.amountPoints > 0);
  assert.equal(data.loyaltyPointsBalance, 5000 - data.amountPoints);

  const stored = await ProductPromotionModel.findById(data.promotion._id).lean();
  assert.equal(stored?.status, PRODUCT_PROMOTION_STATUS_ACTIVE);
  assert.ok(stored?.pointsChargedAt);
  assert.ok(stored?.activatedAt);

  const catalogProduct = await ProductModel.findById(product._id).lean();
  assert.equal(catalogProduct?.catalogPromotionTier, 1);
  assert.ok(catalogProduct?.catalogPromotionExpiresAt);
});

test("нехватка баллов не создаёт заявку", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie, user } = await registerSeller("promo-poor");
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { userLoyaltyPoints: 1, userLoyaltyPointsReserved: 0 } },
  );

  const product = await createProductViaApi(request, cookie, {
    productName: "Promo Poor Product",
    productPrice: 10000,
  });
  await approveProduct(product._id);

  const response = await request(`/product/${product._id}/promotions/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      tier: 1,
      tariffCode: "24h",
      paymentMethod: "points",
      idempotencyKey: "promo-poor-1",
    }),
  });
  assert.equal(response.status, 409);

  const count = await ProductPromotionModel.countDocuments({
    productId: product._id,
  });
  assert.equal(count, 0);
});

test("sbp по умолчанию оставляет awaiting_payment", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie } = await registerSeller("promo-sbp");

  const product = await createProductViaApi(request, cookie, {
    productName: "Promo Sbp Product",
    productPrice: 10000,
  });
  await approveProduct(product._id);

  const response = await request(`/product/${product._id}/promotions/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      tier: 1,
      tariffCode: "24h",
      idempotencyKey: "promo-sbp-1",
    }),
  });
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  assert.equal(data.requiresPayment, true);
  assert.equal(data.promotion.status, PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT);
  assert.equal(data.promotion.paymentMethod, PRODUCT_PROMOTION_PAYMENT_METHOD_SBP);
});

test("staff может оплатить чужой товар баллами со своего баланса", async () => {
  await ensureProductCategoryTreeSeeded();
  const { cookie: sellerCookie, user: seller } = await registerSeller("promo-owner");
  const { cookie: adminCookie, user: admin } = await registerUserAndGetCookie(
    request,
    "promo-admin",
  );
  await setUserRole(admin._id, "admin");
  await UserModel.updateOne(
    { _id: admin._id },
    { $set: { userLoyaltyPoints: 8000, userLoyaltyPointsReserved: 0 } },
  );

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Staff Promo Product",
    productPrice: 10000,
  });
  await approveProduct(product._id);

  const response = await request(`/product/${product._id}/promotions/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      tier: 1,
      tariffCode: "24h",
      paymentMethod: "points",
      idempotencyKey: "promo-staff-1",
    }),
  });
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  assert.equal(data.promotion.status, PRODUCT_PROMOTION_STATUS_ACTIVE);
  assert.equal(String(data.promotion.sellerId), String(seller._id));

  const adminAfter = await UserModel.findById(admin._id).lean();
  assert.equal(adminAfter?.userLoyaltyPoints, 8000 - data.amountPoints);

  const sellerAfter = await UserModel.findById(seller._id).lean();
  assert.equal(Number(sellerAfter?.userLoyaltyPoints) || 0, 0);
});

// sanity: service helper still callable without HTTP for regression of import graph
test("requestProductPromotion service rejects unknown paymentMethod as sbp", async () => {
  await ensureProductCategoryTreeSeeded();
  const { user } = await registerSeller("promo-svc");
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { userLoyaltyPoints: 100 } },
  );
  const product = await ProductModel.create({
    productName: "Svc",
    productPrice: 1000,
    productSeller: user._id,
    productCategory: "electronics",
    productModerationStatus: "approved",
    productIsAvailable: true,
    productStockQuantity: 1,
  });

  const result = await requestProductPromotion({
    userId: String(user._id),
    productId: String(product._id),
    tier: 1,
    tariffCode: "24h",
    paymentMethod: "weird",
    idempotencyKey: "promo-svc-1",
  });
  assert.equal(result.requiresPayment, true);
  assert.equal(result.promotion.paymentMethod, PRODUCT_PROMOTION_PAYMENT_METHOD_SBP);
});
