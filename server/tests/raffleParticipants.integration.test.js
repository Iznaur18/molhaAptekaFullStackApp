import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { raffleParticipantsDataSchema } from "@molha/api-contract";

import {
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
} from "../constants/orderConstants.js";
import { OrderModel, ProductModel, RaffleModel } from "../models/index.js";
import { completeRaffleById } from "../services/raffle/raffleHelpers.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
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

const HOUR_MS = 60 * 60 * 1000;

/**
 * Активный розыгрыш с одним товаром и тремя заказами:
 * buyerA — 1 шт. (подтверждён), buyerB — 2 + 1 шт. (подтверждены),
 * buyerA — ещё 5 шт., но заказ не подтверждён и в зачёт не идёт.
 */
const seedActiveRaffle = async (status = "active") => {
  await ensureProductCategoryTreeSeeded();
  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "raffle-part-seller",
  );
  const { user: buyerA } = await registerUserAndGetCookie(request, "raffle-part-a");
  const { user: buyerB } = await registerUserAndGetCookie(request, "raffle-part-b");
  const { cookie: modCookie, user: mod } = await registerUserAndGetCookie(
    request,
    "raffle-part-mod",
  );
  await setUserRole(mod._id, "moderator");

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Raffle participants product",
  });
  await approveProductViaApi(request, modCookie, String(product._id));

  const startedAt = new Date(Date.now() - 2 * HOUR_MS);
  const raffle = await RaffleModel.create({
    sellerId: seller._id,
    title: "Participants raffle",
    targetSales: 100,
    status,
    approvedAt: startedAt,
  });
  await ProductModel.updateOne(
    { _id: product._id },
    { $set: { activeRaffleId: raffle._id, raffleParticipationEnabledAt: startedAt } },
  );

  const createOrder = (buyer, quantity, itemStatus) =>
    OrderModel.create({
      userBuyerId: buyer._id,
      items: [
        {
          productId: product._id,
          quantity,
          unitPriceAtOrder: 100,
          productNameAtOrder: "Raffle participants product",
          sellerIdAtOrder: seller._id,
          status: itemStatus,
          confirmedAt: itemStatus === ORDER_STATUS_CONFIRMED ? new Date() : null,
        },
      ],
      totalAmount: 100 * quantity,
      fulfillmentMethod: "delivery",
      deliveryAddress: "Test delivery address",
      deliveryAddressFlat: "1",
      paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
    });

  await createOrder(buyerA, 1, ORDER_STATUS_CONFIRMED);
  await createOrder(buyerB, 2, ORDER_STATUS_CONFIRMED);
  await createOrder(buyerB, 1, ORDER_STATUS_CONFIRMED);
  await createOrder(buyerA, 5, ORDER_STATUS_PENDING);

  return { raffleId: String(raffle._id), buyerA, buyerB };
};

const fetchParticipants = async (raffleId) => {
  const response = await request(`/product/raffles/${raffleId}/participants`);
  assert.equal(response.status, 200, await response.clone().text());
  const data = await parseSuccessData(response);
  assert.equal(raffleParticipantsDataSchema.safeParse(data).success, true);
  return data;
};

test("участники активного розыгрыша: кто сколько купил, по убыванию", async () => {
  const { raffleId, buyerA, buyerB } = await seedActiveRaffle();

  const data = await fetchParticipants(raffleId);

  assert.equal(data.total, 2);
  assert.deepEqual(
    data.participants.map((row) => [row.userId, row.ticketCount]),
    [
      [String(buyerB._id), 3],
      [String(buyerA._id), 1],
    ],
  );
  assert.ok(data.participants.every((row) => row.userName.length > 0));
});

test("после завершения список берётся из снимка — товары уже отвязаны", async () => {
  const { raffleId, buyerB } = await seedActiveRaffle();

  await completeRaffleById(raffleId);
  const product = await ProductModel.findOne({ activeRaffleId: raffleId }).lean();
  assert.equal(product, null);

  const data = await fetchParticipants(raffleId);

  assert.equal(data.total, 2);
  assert.equal(data.participants[0].userId, String(buyerB._id));
  assert.equal(data.participants[0].ticketCount, 3);
});

test("розыгрыш на модерации гостю не виден", async () => {
  const { raffleId } = await seedActiveRaffle("pending_staff");

  const response = await request(`/product/raffles/${raffleId}/participants`);

  assert.equal(response.status, 404);
});
