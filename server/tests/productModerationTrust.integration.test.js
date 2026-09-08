import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../constants/productModerationConstants.js";
import { ProductModel, StaffAuditLogModel, UserModel } from "../models/index.js";
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

/** @type {import('node:http').Server | null} */
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

const trustPath = (userId) => `/staff/sellers/${userId}/product-moderation-trust`;

const setTrustViaApi = async ({ cookie, userId, trusted, expectedStatus = 200 }) => {
  const response = await request(trustPath(userId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ trusted }),
  });
  assert.equal(response.status, expectedStatus);
  return response;
};

const registerSeller = async (suffix) => {
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await verifyUserEmail(`int-${suffix}@example.com`);
  return { cookie, user };
};

const registerAdmin = async (suffix) => {
  const { cookie, user } = await registerUserAndGetCookie(request, suffix);
  await setUserRole(user._id, "admin");
  return { cookie, user };
};

test("товар доверенного продавца публикуется без модерации", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerSeller("trust-seller");
  const { cookie: adminCookie } = await registerAdmin("trust-admin");

  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Trusted Seller Product",
  });

  assert.equal(product.productModerationStatus, PRODUCT_MODERATION_APPROVED);
  assert.equal(product.productIsAvailable, true);

  const stored = await ProductModel.findById(product._id).lean();
  assert.ok(stored?.productModerationApprovedHash, "отпечаток одобрения обязателен");

  const catalog = await parseSuccessData(await request("/product"));
  const ids = (catalog.products ?? []).map((row) => String(row._id));
  assert.ok(ids.includes(String(product._id)), "товар должен быть в каталоге сразу");
});

test("правка содержимого не уводит товар доверенного продавца в очередь", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerSeller("trust-edit");
  const { cookie: adminCookie } = await registerAdmin("trust-edit-admin");
  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Trusted Edit Product",
  });
  const hashBefore = (await ProductModel.findById(product._id).lean())
    ?.productModerationApprovedHash;

  const patchResponse = await request(`/product/${product._id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: sellerCookie },
    body: JSON.stringify({ productName: "Trusted Edit Product v2" }),
  });
  assert.equal(patchResponse.status, 200);

  const patched = await ProductModel.findById(product._id).lean();
  assert.equal(patched?.productModerationStatus, PRODUCT_MODERATION_APPROVED);
  assert.equal(patched?.productIsAvailable, true);
  assert.notEqual(
    patched?.productModerationApprovedHash,
    hashBefore,
    "отпечаток должен догнать новое содержимое",
  );
});

test("снятие доверия возвращает проверку только для новых товаров", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerSeller("trust-revoke");
  const { cookie: adminCookie } = await registerAdmin("trust-revoke-admin");

  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });
  const published = await createProductViaApi(request, sellerCookie, {
    productName: "Published Before Revoke",
  });

  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: false });
  const afterRevoke = await createProductViaApi(request, sellerCookie, {
    productName: "Created After Revoke",
  });

  const stillApproved = await ProductModel.findById(published._id).lean();
  assert.equal(stillApproved?.productModerationStatus, PRODUCT_MODERATION_APPROVED);
  assert.equal(afterRevoke.productModerationStatus, PRODUCT_MODERATION_PENDING);
  assert.equal(afterRevoke.productIsAvailable, false);
});

test("доверие выдаёт только админ и действие попадает в журнал staff", async () => {
  const { user: seller } = await registerSeller("trust-guard-seller");
  const { cookie: moderatorCookie, user: moderator } = await registerUserAndGetCookie(
    request,
    "trust-guard-mod",
  );
  await setUserRole(moderator._id, "moderator");
  const { cookie: adminCookie } = await registerAdmin("trust-guard-admin");

  await setTrustViaApi({
    cookie: moderatorCookie,
    userId: seller._id,
    trusted: true,
    expectedStatus: 403,
  });
  assert.equal(
    (await UserModel.findById(seller._id).lean())?.productModerationTrusted,
    false,
  );

  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });
  assert.equal(
    (await UserModel.findById(seller._id).lean())?.productModerationTrusted,
    true,
  );

  const auditEntries = await StaffAuditLogModel.find({ statusCode: 200 }).lean();
  assert.ok(
    auditEntries.some((row) => String(row.path).includes("product-moderation-trust")),
    "выдача доверия должна попасть в журнал staff-действий",
  );
});

test("уведомление продавцу приходит один раз на изменение", async () => {
  const { cookie: sellerCookie, user: seller } = await registerSeller("trust-notify");
  const { cookie: adminCookie } = await registerAdmin("trust-notify-admin");

  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });
  await setTrustViaApi({ cookie: adminCookie, userId: seller._id, trusted: true });

  const me = await parseSuccessData(
    await request("/auth/me", { headers: { Cookie: sellerCookie } }),
  );
  const trustNotifications = (me.inAppNotifications ?? []).filter((row) =>
    String(row.kind).startsWith("product_moderation_trust"),
  );

  assert.equal(trustNotifications.length, 1);
  assert.equal(me.user.productModerationTrusted, true);
});
