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
  buildOrderBody,
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

const jsonHeaders = (cookie) => ({
  "Content-Type": "application/json",
  Cookie: cookie,
});

/**
 * Аукционный товар продавца, прошедший модерацию, и покупатель с подтверждёнными
 * данными — минимальная сцена для ставок.
 *
 * @param {string} suffix
 */
const seedAuctionScene = async (suffix) => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    `${suffix}-seller`,
  );
  await confirmUserData(seller._id);
  await verifyUserEmail(seller.email);

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Auction cart product",
    productAuctionEnabled: true,
  });
  const productId = String(product._id);

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    `${suffix}-mod`,
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, productId);

  const { cookie: buyerCookie, user: buyer } = await registerUserAndGetCookie(
    request,
    `${suffix}-buyer`,
  );
  await confirmUserData(buyer._id);
  await verifyUserEmail(buyer.email);

  return { sellerCookie, buyerCookie, productId };
};

/**
 * @param {string} buyerCookie
 * @param {string} productId
 * @param {number} offerPrice
 */
const submitOffer = async (buyerCookie, productId, offerPrice) => {
  const response = await request(`/product/${productId}/price-offers`, {
    method: "POST",
    headers: jsonHeaders(buyerCookie),
    body: JSON.stringify({ offerPrice }),
  });
  const data = await parseSuccessData(response);
  return String(data.offer._id);
};

/**
 * @param {string} sellerCookie
 * @param {string} productId
 * @param {string} offerId
 */
const acceptOffer = async (sellerCookie, productId, offerId) => {
  await parseSuccessData(
    await request(`/product/${productId}/price-offers/${offerId}/accept`, {
      method: "PATCH",
      headers: { Cookie: sellerCookie },
    }),
  );
};

/** @param {string} buyerCookie */
const fetchMyBids = async (buyerCookie) => {
  const data = await parseSuccessData(
    await request("/price-offers/my-bids", { headers: { Cookie: buyerCookie } }),
  );
  return data.bids;
};

before(async () => {
  await connectMongoTestReplSet();
  const { ProductPriceOfferModel } = await import("../models/index.js");
  await ProductPriceOfferModel.syncIndexes();
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

test("принятая ставка попадает в корзину покупателя и оформляется отдельным заказом", async () => {
  const { sellerCookie, buyerCookie, productId } = await seedAuctionScene("cart-flow");

  const offerId = await submitOffer(buyerCookie, productId, 777);
  await acceptOffer(sellerCookie, productId, offerId);

  const acceptedBids = await fetchMyBids(buyerCookie);
  assert.equal(acceptedBids.length, 1);
  assert.equal(acceptedBids[0].status, "accepted");
  assert.equal(acceptedBids[0].offerPrice, 777);
  assert.ok(acceptedBids[0].paymentDeadlineAt);

  const orderData = await parseSuccessData(
    await request("/order", {
      method: "POST",
      headers: jsonHeaders(buyerCookie),
      body: JSON.stringify({ ...buildOrderBody(productId), priceOfferId: offerId }),
    }),
  );
  assert.equal(String(orderData.order.priceOfferId), offerId);
  assert.equal(orderData.order.items[0].unitPriceAtOrder, 777);

  const salesData = await parseSuccessData(
    await request("/order/sales", { headers: { Cookie: sellerCookie } }),
  );
  const sale = salesData.orders.find(
    (order) => String(order._id) === String(orderData.order._id),
  );
  assert.ok(sale, "заказ по ставке виден продавцу в «Моих продажах»");
  assert.equal(String(sale.priceOfferId), offerId);

  assert.deepEqual(await fetchMyBids(buyerCookie), []);
});

test("после заказа по ставке можно снова принять предложение на re-open аукционе", async () => {
  const { sellerCookie, buyerCookie, productId } =
    await seedAuctionScene("reopen-accept");

  const firstOfferId = await submitOffer(buyerCookie, productId, 700);
  await acceptOffer(sellerCookie, productId, firstOfferId);

  await parseSuccessData(
    await request("/order", {
      method: "POST",
      headers: jsonHeaders(buyerCookie),
      body: JSON.stringify({
        ...buildOrderBody(productId),
        priceOfferId: firstOfferId,
      }),
    }),
  );

  const { ProductModel } = await import("../models/index.js");
  await ProductModel.findByIdAndUpdate(productId, {
    $set: { productAuctionEnabled: true },
  });

  const sellerListAfterPaid = await parseSuccessData(
    await request(`/product/${productId}/price-offers`, {
      headers: { Cookie: sellerCookie },
    }),
  );
  assert.deepEqual(
    sellerListAfterPaid.offers,
    [],
    "оплаченные ставки не должны висеть в активном списке продавца",
  );

  const archiveAfterPaid = await parseSuccessData(
    await request(`/product/${productId}/price-offers/archive`, {
      headers: { Cookie: sellerCookie },
    }),
  );
  assert.equal(archiveAfterPaid.offers.length, 1);
  assert.equal(String(archiveAfterPaid.offers[0]._id), firstOfferId);

  const { cookie: buyer2Cookie, user: buyer2 } = await registerUserAndGetCookie(
    request,
    "reopen-accept-buyer2",
  );
  await confirmUserData(buyer2._id);
  await verifyUserEmail(buyer2.email);

  const secondOfferId = await submitOffer(buyer2Cookie, productId, 800);
  await acceptOffer(sellerCookie, productId, secondOfferId);

  const sellerListAfterAccept = await parseSuccessData(
    await request(`/product/${productId}/price-offers`, {
      headers: { Cookie: sellerCookie },
    }),
  );
  assert.equal(sellerListAfterAccept.offers.length, 1);
  assert.equal(String(sellerListAfterAccept.offers[0]._id), secondOfferId);
  assert.equal(sellerListAfterAccept.offers[0].status, "accepted");

  const bids = await fetchMyBids(buyer2Cookie);
  assert.equal(bids.length, 1);
  assert.equal(bids[0].status, "accepted");
  assert.equal(bids[0].offerPrice, 800);
});

test("тот же покупатель может снова ставить после заказа и re-open аукциона", async () => {
  const { sellerCookie, buyerCookie, productId } =
    await seedAuctionScene("reopen-same-buyer");

  const firstOfferId = await submitOffer(buyerCookie, productId, 650);
  await acceptOffer(sellerCookie, productId, firstOfferId);

  await parseSuccessData(
    await request("/order", {
      method: "POST",
      headers: jsonHeaders(buyerCookie),
      body: JSON.stringify({
        ...buildOrderBody(productId),
        priceOfferId: firstOfferId,
      }),
    }),
  );

  const meAfterOrder = await parseSuccessData(
    await request(`/product/${productId}/price-offers/me`, {
      headers: { Cookie: buyerCookie },
    }),
  );
  assert.equal(meAfterOrder.offer, null);

  const { ProductModel } = await import("../models/index.js");
  await ProductModel.findByIdAndUpdate(productId, {
    $set: { productAuctionEnabled: true },
  });

  const secondOfferId = await submitOffer(buyerCookie, productId, 900);
  assert.notEqual(secondOfferId, firstOfferId);

  const meAfterRebid = await parseSuccessData(
    await request(`/product/${productId}/price-offers/me`, {
      headers: { Cookie: buyerCookie },
    }),
  );
  assert.equal(meAfterRebid.offer.status, "pending");
  assert.equal(meAfterRebid.offer.offerPrice, 900);

  await acceptOffer(sellerCookie, productId, secondOfferId);
  const bids = await fetchMyBids(buyerCookie);
  assert.equal(bids.length, 1);
  assert.equal(bids[0].offerPrice, 900);
});

test("покупатель может убрать принятый лот из корзины — ставка отменяется", async () => {
  const { sellerCookie, buyerCookie, productId } =
    await seedAuctionScene("cart-remove");

  const offerId = await submitOffer(buyerCookie, productId, 555);
  await acceptOffer(sellerCookie, productId, offerId);

  await parseSuccessData(
    await request(`/product/${productId}/price-offers/me`, {
      method: "DELETE",
      headers: { Cookie: buyerCookie },
    }),
  );

  assert.deepEqual(await fetchMyBids(buyerCookie), []);

  const orderResponse = await request("/order", {
    method: "POST",
    headers: jsonHeaders(buyerCookie),
    body: JSON.stringify({ ...buildOrderBody(productId), priceOfferId: offerId }),
  });
  assert.notEqual(orderResponse.status, 200);
});
