import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

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

const seedRegionCatalogFixture = async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(request, "region-seller");
  await verifyUserEmail("int-region-seller@example.com");

  const moscowProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Moscow Product",
    productRegionCode: "RU-MOW",
  });
  const chechnyaProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Chechnya Product",
    productRegionCode: "RU-CE",
  });
  const spbProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Spb Product",
    productRegionCode: "RU-SPE",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "region-mod",
  );
  await setUserRole(modUser._id, "moderator");

  await approveProductViaApi(request, modCookie, String(moscowProduct._id));
  await approveProductViaApi(request, modCookie, String(chechnyaProduct._id));
  await approveProductViaApi(request, modCookie, String(spbProduct._id));

  const { cookie: buyerCookie, user: buyer } = await registerUserAndGetCookie(
    request,
    "region-buyer",
  );
  await verifyUserEmail("int-region-buyer@example.com");
  await UserModel.findByIdAndUpdate(buyer._id, {
    userRegionCode: "RU-MOW",
  });

  return {
    buyerCookie,
    productIds: {
      moscow: String(moscowProduct._id),
      chechnya: String(chechnyaProduct._id),
      spb: String(spbProduct._id),
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

test("GET /product shows all regions (no hard filter)", async () => {
  const { buyerCookie, productIds } = await seedRegionCatalogFixture();

  const ids = await fetchCatalogProductIds(buyerCookie, "?limit=100");
  assert.ok(ids.includes(productIds.moscow));
  assert.ok(ids.includes(productIds.chechnya));
  assert.ok(ids.includes(productIds.spb));
});

test("GET /product prioritizes Moscow then Spb over other regions", async () => {
  const { buyerCookie, productIds } = await seedRegionCatalogFixture();

  const ids = await fetchCatalogProductIds(buyerCookie, "?limit=100");
  const moscowIdx = ids.indexOf(productIds.moscow);
  const spbIdx = ids.indexOf(productIds.spb);
  const chechnyaIdx = ids.indexOf(productIds.chechnya);
  assert.ok(moscowIdx >= 0 && spbIdx >= 0 && chechnyaIdx >= 0);
  assert.ok(moscowIdx < spbIdx);
  assert.ok(spbIdx < chechnyaIdx);
});

test("GET /product?regionCode= boosts selected region first", async () => {
  const { buyerCookie, productIds } = await seedRegionCatalogFixture();

  const ids = await fetchCatalogProductIds(
    buyerCookie,
    "?regionCode=RU-CE&limit=100",
  );
  assert.equal(ids[0], productIds.chechnya);
  assert.ok(ids.includes(productIds.moscow));
  assert.ok(ids.includes(productIds.spb));
});

test("GET /product guest defaults to Moscow priority, shows all", async () => {
  const { productIds } = await seedRegionCatalogFixture();

  const response = await request("/product?limit=100");
  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  const ids = data.products.map((product) => String(product._id));
  assert.ok(ids.includes(productIds.moscow));
  assert.ok(ids.includes(productIds.chechnya));
  assert.ok(ids.indexOf(productIds.moscow) < ids.indexOf(productIds.chechnya));
});
