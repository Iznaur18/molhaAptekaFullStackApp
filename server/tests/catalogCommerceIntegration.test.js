import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { PRODUCT_MODERATION_PENDING } from "../constants/productModerationConstants.js";
import { SELLER_PRODUCTS_LIMIT_REGULAR } from "../constants/productConstants.js";
import { ProductModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  buildOrderBody,
  buildTestProductPayload,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseErrorMessage,
  parseSuccessData,
  registerUserAndGetCookie,
  SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE,
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

const seedCatalogFixture = async () => {
  await ensureProductCategoryTreeSeeded();
};

test("commerce: PUT /cart → POST /order (approved product)", async () => {
  await seedCatalogFixture();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    "seller-cart",
  );
  await verifyUserEmail("int-seller-cart@example.com");

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Cart Order Product",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "mod-cart",
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, String(product._id));

  const { cookie: buyerCookie } = await registerUserAndGetCookie(request, "buyer-cart");
  await verifyUserEmail("int-buyer-cart@example.com");

  const productId = String(product._id);
  const cartData = await parseSuccessData(
    await request("/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: buyerCookie,
      },
      body: JSON.stringify({ items: { [productId]: 1 } }),
    }),
  );
  assert.equal(cartData.items[productId], 1);

  const orderData = await parseSuccessData(
    await request("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: buyerCookie,
      },
      body: JSON.stringify(buildOrderBody(productId)),
    }),
  );
  assert.ok(orderData.order?._id);
  assert.equal(orderData.order.items.length, 1);
});

test("seller limit: POST /product сверх лимита → 403", async () => {
  await seedCatalogFixture();

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "seller-limit",
  );
  await verifyUserEmail("int-seller-limit@example.com");

  // Засеваем товары до лимита напрямую в БД: часовой rate limit на POST /product
  // (30/час) сработал бы раньше лимита продавца (50) и не дал бы проверить именно
  // бизнес-правило лимита. Прямой insert проверяет счётчик countSellerProducts.
  await ProductModel.insertMany(
    Array.from({ length: SELLER_PRODUCTS_LIMIT_REGULAR }, (_unused, i) => ({
      productName: `Limit Product ${i + 1}`,
      productPrice: 100,
      productCategory: "electronics",
      productSeller: seller._id,
    })),
  );

  const blocked = await request("/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie,
    },
    body: JSON.stringify(
      buildTestProductPayload({
        productName: `Limit Product ${SELLER_PRODUCTS_LIMIT_REGULAR + 1}`,
      }),
    ),
  });
  assert.equal(blocked.status, 403);
  const message = await parseErrorMessage(blocked);
  assert.equal(message, SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE);
});

test("moderation: pending → approve → visible in GET /product", async () => {
  await seedCatalogFixture();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    "seller-mod",
  );
  await verifyUserEmail("int-seller-mod@example.com");

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Moderation Queue Product",
  });
  const productId = String(product._id);

  const stored = await ProductModel.findById(productId)
    .select("productModerationStatus")
    .lean();
  assert.equal(stored?.productModerationStatus, PRODUCT_MODERATION_PENDING);

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "mod-queue",
  );
  await setUserRole(modUser._id, "moderator");

  const pendingData = await parseSuccessData(
    await request("/product/moderation/pending", {
      headers: { Cookie: modCookie },
    }),
  );
  const pendingIds = pendingData.products.map((p) => String(p._id));
  assert.ok(pendingIds.includes(productId));

  await approveProductViaApi(request, modCookie, productId);

  const catalogData = await parseSuccessData(await request("/product"));
  const catalogIds = catalogData.products.map((p) => String(p._id));
  assert.ok(catalogIds.includes(productId));
});
