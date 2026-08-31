import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel } = await import("../models/index.js");
const { getReservedQuantityByProductIds } = await import(
  "../services/product/productStock.js"
);
const { ORDER_STATUSES, ORDER_STOCK_RESERVING_STATUSES } = await import(
  "../constants/orderConstants.js"
);

describe("какие статусы держат остаток", () => {
  it("держат все, кроме отменённого, вернувшегося и подтверждённого", () => {
    const notReserving = ORDER_STATUSES.filter(
      (status) => !ORDER_STOCK_RESERVING_STATUSES.includes(status),
    ).sort();

    assert.deepEqual(notReserving, ["cancelled", "confirmed", "returned"]);
  });

  it("спор держит остаток", () => {
    assert.ok(
      ORDER_STOCK_RESERVING_STATUSES.includes("disputed"),
      "товар неизвестно где — продавать его второй раз нельзя",
    );
  });

  it("ступени сборки и курьера держат остаток", () => {
    for (const status of [
      "accepted",
      "assembling",
      "ready_for_pickup",
      "ready_to_ship",
      "courier_assigned",
      "courier_holding",
      "in_delivery",
    ]) {
      assert.ok(
        ORDER_STOCK_RESERVING_STATUSES.includes(status),
        `${status} обязан держать остаток, иначе товар продадут дважды`,
      );
    }
  });
});

describe("остаток на живой базе", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** @param {string} status */
  async function reservedAt(status) {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { "items.0.status": status } },
    );

    const reserved = await getReservedQuantityByProductIds([String(product._id)]);
    return reserved[String(product._id)] ?? 0;
  }

  it("«Принят» не освобождает товар", async () => {
    assert.equal(
      await reservedAt("accepted"),
      1,
      "до этой правки после «Принять» тот же товар можно было продать второй раз",
    );
  });

  it("«У курьера» не освобождает товар", async () => {
    assert.equal(await reservedAt("courier_holding"), 1);
  });

  it("спор не освобождает товар", async () => {
    assert.equal(await reservedAt("disputed"), 1);
  });

  it("отмена и возврат освобождают", async () => {
    assert.equal(await reservedAt("cancelled"), 0);
    assert.equal(await reservedAt("returned"), 0);
  });

  it("подтверждение освобождает — остаток уже списан", async () => {
    assert.equal(await reservedAt("confirmed"), 0);
  });
});
