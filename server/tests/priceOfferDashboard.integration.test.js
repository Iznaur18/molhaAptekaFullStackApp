import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";
import {
  approveProductViaApi,
  confirmUserData,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
  verifyUserEmail,
} from "./helpers/integrationTestHelpers.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

const assertMobileAuctionPayload = (body, field) => {
  assert.equal(body?.success, true, JSON.stringify(body));
  assert.ok(Array.isArray(body?.data?.[field]), JSON.stringify(body));
};

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

test("price-offers dashboard: my-bids and incoming return arrays for mobile", async () => {
  const { cookie } = await registerUserAndGetCookie(request, "auction-dash");

  const myBidsResponse = await request("/price-offers/my-bids", {
    headers: { Cookie: cookie },
  });
  assert.equal(myBidsResponse.status, 200);
  const myBidsBody = await myBidsResponse.json();
  assertMobileAuctionPayload(myBidsBody, "bids");
  assert.deepEqual(myBidsBody.data.bids, []);

  const incomingResponse = await request("/price-offers/incoming", {
    headers: { Cookie: cookie },
  });
  assert.equal(incomingResponse.status, 200);
  const incomingBody = await incomingResponse.json();
  assertMobileAuctionPayload(incomingBody, "offers");
  assert.deepEqual(incomingBody.data.offers, []);

  const pendingCount = await parseSuccessData(
    await request("/price-offers/incoming/pending-count", {
      headers: { Cookie: cookie },
    }),
  );
  assert.equal(pendingCount.count, 0);
});

test("price-offers top returns top array for mobile product auction tab", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "auction-top-seller",
  );
  await confirmUserData(seller._id);
  await verifyUserEmail(seller.email);

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Auction top product",
    productAuctionEnabled: true,
  });
  const productId = String(product._id);

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "auction-top-mod",
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, productId);

  const topResponse = await request(`/product/${productId}/price-offers/top`);
  assert.equal(topResponse.status, 200);
  const topBody = await topResponse.json();
  assert.equal(topBody.success, true);
  assert.ok(Array.isArray(topBody.data?.top), JSON.stringify(topBody));
});
