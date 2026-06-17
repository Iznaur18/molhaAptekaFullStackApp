import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { PRODUCT_SORT_CITY } from "../constants/productCatalogSort.js";
import { UserModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
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
import { resolveUserAddressCityNormalized } from "../services/product/ruCityNormalized.js";

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

const seedCityCatalogFixture = async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(request, "city-seller");
  await verifyUserEmail("int-city-seller@example.com");

  const moscowProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Moscow Product",
    productSaleCity: "г Москва",
  });
  const kazanProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Kazan Product",
    productSaleCity: "Казань",
  });
  const everywhereProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Everywhere Product",
    productSaleCity: "",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "city-mod",
  );
  await setUserRole(modUser._id, "moderator");

  await approveProductViaApi(request, modCookie, String(moscowProduct._id));
  await approveProductViaApi(request, modCookie, String(kazanProduct._id));
  await approveProductViaApi(request, modCookie, String(everywhereProduct._id));

  const { cookie: buyerCookie, user: buyer } = await registerUserAndGetCookie(
    request,
    "city-buyer",
  );
  await verifyUserEmail("int-city-buyer@example.com");
  await UserModel.findByIdAndUpdate(buyer._id, {
    userAddressCity: "Москва",
    userAddressCityNormalized: resolveUserAddressCityNormalized("Москва"),
  });

  return {
    buyerCookie,
    productIds: {
      moscow: String(moscowProduct._id),
      kazan: String(kazanProduct._id),
      everywhere: String(everywhereProduct._id),
    },
  };
};

const fetchCatalogProductIds = async (cookie, query = "") => {
  const response = await request(`/product${query}`, {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  return data.products.map((product) => String(product._id));
};

test("GET /product auto-filters by buyer city with normalized match", async () => {
  const { buyerCookie, productIds } = await seedCityCatalogFixture();

  const ids = await fetchCatalogProductIds(buyerCookie);
  assert.ok(ids.includes(productIds.moscow));
  assert.ok(ids.includes(productIds.everywhere));
  assert.equal(ids.includes(productIds.kazan), false);
});

test("GET /product?sort=city shows all cities with buyer city first", async () => {
  const { buyerCookie, productIds } = await seedCityCatalogFixture();

  const ids = await fetchCatalogProductIds(
    buyerCookie,
    `?sort=${PRODUCT_SORT_CITY}&limit=100`,
  );
  assert.equal(ids.length, 3);
  assert.equal(ids[0], productIds.moscow);
  assert.ok(ids.includes(productIds.kazan));
  assert.ok(ids.includes(productIds.everywhere));
});

test("GET /product?allCities=true disables auto city filter", async () => {
  const { buyerCookie, productIds } = await seedCityCatalogFixture();

  const ids = await fetchCatalogProductIds(buyerCookie, "?allCities=true&limit=100");
  assert.equal(ids.length, 3);
  assert.ok(ids.includes(productIds.kazan));
});
