import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { createOrderLoyaltyFixture, createOrderWithReserveTransaction } =
  await import("./helpers/orderLoyaltyTestHelpers.js");
const { OrderModel, ProductModel, UserModel } = await import("../models/index.js");
const { advanceOrderShipmentStatus } = await import(
  "../services/order/advanceShipmentStatus.js"
);
const {
  normalizeDeliveryFee,
  raiseShipmentDeliveryFee,
  resolveDeliveryFeesBySeller,
} = await import("../services/courier/courierDeliveryFee.js");
const { haversineKm, listCourierOverview } = await import(
  "../services/courier/courierOverview.js"
);
const { acceptShipmentByCourier } = await import(
  "../services/courier/courierShipmentFlow.js"
);

describe("сумма доставки", () => {
  it("минимум сто рублей", () => {
    assert.equal(normalizeDeliveryFee(100), 100);
    assert.throws(() => normalizeDeliveryFee(75), /Минимальная подача/);
  });

  it("шаг двадцать пять", () => {
    assert.equal(normalizeDeliveryFee(125), 125);
    assert.equal(normalizeDeliveryFee(400), 400);
    assert.throws(() => normalizeDeliveryFee(130), /шагом 25/);
  });

  it("дробное и нечисловое не принимается", () => {
    assert.throws(() => normalizeDeliveryFee(150.5), /целым числом/);
    assert.throws(() => normalizeDeliveryFee("много"), /целым числом/);
  });

  it("самовывозу цена не назначается", () => {
    const fees = resolveDeliveryFeesBySeller({
      fulfillmentBySellerId: { s1: "pickup", s2: "delivery" },
      feeBySellerId: { s1: 500, s2: 250 },
    });
    assert.equal(fees.s1, 0, "платить курьеру у самовывоза некому");
    assert.equal(fees.s2, 250);
  });

  it("без присланной суммы берётся минимум", () => {
    const fees = resolveDeliveryFeesBySeller({
      fulfillmentBySellerId: { s1: "delivery" },
      feeBySellerId: null,
    });
    assert.equal(fees.s1, 100);
  });
});

describe("расстояние", () => {
  it("до себя — ноль", () => {
    assert.equal(haversineKm({ lat: 55.75, lon: 37.62 }, { lat: 55.75, lon: 37.62 }), 0);
  });

  it("Москва — Петербург около 630 км", () => {
    const km = haversineKm({ lat: 55.75, lon: 37.62 }, { lat: 59.94, lon: 30.31 });
    assert.ok(km > 600 && km < 660, `получилось ${km}`);
  });
});

describe("покупатель поднимает сумму", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  async function deliveryOrder() {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          fulfillmentMethod: "delivery",
          shipments: [
            { sellerId: seller._id, fulfillmentMethod: "delivery", courierDelivery: true, deliveryFeeRub: 100 },
          ],
        },
      },
    );
    return { order, seller, buyer, product };
  }

  it("повышает и сохраняет", async () => {
    const { order, seller, buyer } = await deliveryOrder();

    const result = await raiseShipmentDeliveryFee({
      orderId: String(order._id),
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
      feeRub: 250,
    });

    assert.equal(result.deliveryFeeRub, 250);
    const fresh = await OrderModel.findById(order._id).lean();
    assert.equal(fresh.shipments[0].deliveryFeeRub, 250);
  });

  it("понижать нельзя", async () => {
    const { order, seller, buyer } = await deliveryOrder();
    await raiseShipmentDeliveryFee({
      orderId: String(order._id),
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
      feeRub: 300,
    });

    await assert.rejects(
      () =>
        raiseShipmentDeliveryFee({
          orderId: String(order._id),
          sellerId: String(seller._id),
          buyerId: String(buyer._id),
          feeRub: 150,
        }),
      /только повысить/i,
      "иначе можно поднять цену, дождаться курьера и снизить обратно",
    );
  });

  it("после курьера сумма заморожена", async () => {
    const { order, seller, buyer } = await deliveryOrder();
    const args = { orderId: String(order._id), sellerId: String(seller._id) };
    await advanceOrderShipmentStatus({ ...args, nextStatus: "accepted" });
    await advanceOrderShipmentStatus({ ...args, nextStatus: "assembling" });
    await advanceOrderShipmentStatus({ ...args, nextStatus: "ready_to_ship" });

    const courier = await UserModel.create({
      userName: "c1",
      email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
      passwordHash: "x".repeat(60),
      courierProfile: { moderationStatus: "approved" },
    });
    await acceptShipmentByCourier({ ...args, courierId: String(courier._id) });

    await assert.rejects(
      () =>
        raiseShipmentDeliveryFee({
          ...args,
          buyerId: String(buyer._id),
          feeRub: 500,
        }),
      /изменить нельзя/i,
    );
  });

  it("чужой сумму не тронет", async () => {
    const { order, seller } = await deliveryOrder();
    const stranger = await createOrderLoyaltyFixture();

    await assert.rejects(
      () =>
        raiseShipmentDeliveryFee({
          orderId: String(order._id),
          sellerId: String(seller._id),
          buyerId: String(stranger.buyer._id),
          feeRub: 300,
        }),
      /покупатель/i,
    );
  });
});

describe("обзор курьера", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** @param {{ region?: string; approved?: boolean }} [options] */
  async function makeCourier({ region = "RU-MOW", approved = true } = {}) {
    return UserModel.create({
      userName: `courier-${Math.random().toString(36).slice(2, 8)}`,
      email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
      passwordHash: "x".repeat(60),
      userAddress: "г Москва",
      userRegionCode: region,
      courierProfile: { moderationStatus: approved ? "approved" : "pending" },
    });
  }

  /** Заказ доставкой, доведённый до «Готов к отгрузке». */
  async function readyOrder({ sellerRegion = "RU-MOW", fee = 250 } = {}) {
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    await UserModel.updateOne(
      { _id: seller._id },
      { $set: { userRegionCode: sellerRegion, userAddress: "г Москва, склад" } },
    );
    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productPickupAddress: "г Москва, ул Складская, 1" } },
    );

    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          fulfillmentMethod: "delivery",
          shipments: [
            {
              sellerId: seller._id,
              fulfillmentMethod: "delivery",
              courierDelivery: true,
              deliveryFeeRub: fee,
            },
          ],
        },
      },
    );

    const args = { orderId: String(order._id), sellerId: String(seller._id) };
    await advanceOrderShipmentStatus({ ...args, nextStatus: "accepted" });
    await advanceOrderShipmentStatus({ ...args, nextStatus: "assembling" });
    await advanceOrderShipmentStatus({ ...args, nextStatus: "ready_to_ship" });
    return { order, seller, buyer, product, args };
  }

  it("показывает готовое отправление с суммой и точкой забора", async () => {
    const courier = await makeCourier();
    await readyOrder({ fee: 350 });

    const result = await listCourierOverview({ courierId: String(courier._id) });

    assert.equal(result.shipments.length, 1);
    const row = result.shipments[0];
    assert.equal(row.deliveryFeeRub, 350);
    assert.equal(row.pickupAddress, "г Москва, ул Складская, 1");
    assert.ok(row.items[0].name, "состав заказа виден — по нему судят о габаритах");
  });

  it("продавец не видит и не берёт своё же отправление", async () => {
    const { seller, args } = await readyOrder({ fee: 300 });
    // Продавец сам подтверждён курьером — но рукопожатие кодами теряет смысл,
    // если продавец и курьер один человек.
    await UserModel.updateOne(
      { _id: seller._id },
      { $set: { "courierProfile.moderationStatus": "approved" } },
    );

    const result = await listCourierOverview({ courierId: String(seller._id) });
    assert.equal(result.shipments.length, 0);

    await assert.rejects(
      () => acceptShipmentByCourier({ ...args, courierId: String(seller._id) }),
      /Свой заказ курьером не возят/i,
    );
  });

  it("покупатель не берёт свой же заказ", async () => {
    const { buyer, args } = await readyOrder({ fee: 300 });
    await UserModel.updateOne(
      { _id: buyer._id },
      {
        $set: {
          "courierProfile.moderationStatus": "approved",
          userRegionCode: "RU-MOW",
          userAddress: "г Москва, дом",
        },
      },
    );

    const result = await listCourierOverview({ courierId: String(buyer._id) });
    assert.equal(result.shipments.length, 0);

    await assert.rejects(
      () => acceptShipmentByCourier({ ...args, courierId: String(buyer._id) }),
      /Свой заказ курьером не возят/i,
    );
  });
  it("не показывает заказы чужого региона", async () => {
    const courier = await makeCourier({ region: "RU-SPE" });
    await readyOrder({ sellerRegion: "RU-MOW" });

    const result = await listCourierOverview({ courierId: String(courier._id) });
    assert.equal(result.shipments.length, 0);
  });

  it("не показывает недособранные заказы", async () => {
    const courier = await makeCourier();
    const { seller, buyer, product } = await createOrderLoyaltyFixture();
    await UserModel.updateOne({ _id: seller._id }, { $set: { userRegionCode: "RU-MOW" } });
    const order = await createOrderWithReserveTransaction({ buyer, seller, product });
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          fulfillmentMethod: "delivery",
          shipments: [{ sellerId: seller._id, fulfillmentMethod: "delivery", courierDelivery: true }],
        },
      },
    );

    const result = await listCourierOverview({ courierId: String(courier._id) });
    assert.equal(result.shipments.length, 0, "«В обработке» курьеру брать нечего");
  });

  it("занятое отправление из обзора пропадает", async () => {
    const courier = await makeCourier();
    const { args } = await readyOrder();

    assert.equal(
      (await listCourierOverview({ courierId: String(courier._id) })).shipments.length,
      1,
    );
    await acceptShipmentByCourier({ ...args, courierId: String(courier._id) });

    assert.equal(
      (await listCourierOverview({ courierId: String(courier._id) })).shipments.length,
      0,
    );
  });

  it("неподтверждённому курьеру обзор закрыт", async () => {
    const courier = await makeCourier({ approved: false });

    await assert.rejects(
      () => listCourierOverview({ courierId: String(courier._id) }),
      /подтверждённые курьеры/i,
    );
  });

  it("без адреса в профиле обзор не собрать", async () => {
    const courier = await makeCourier();
    await UserModel.updateOne({ _id: courier._id }, { $set: { userRegionCode: "" } });

    await assert.rejects(
      () => listCourierOverview({ courierId: String(courier._id) }),
      /адрес в профиле/i,
    );
  });

  it("точный адрес покупателя в обзоре не раскрывается", async () => {
    const courier = await makeCourier();
    await readyOrder();

    const [row] = (await listCourierOverview({ courierId: String(courier._id) }))
      .shipments;

    assert.equal(row.buyerPhone, undefined);
    assert.equal(row.deliveryAddress, undefined, "до передачи товара — только район");
    assert.ok(typeof row.deliveryAreaHint === "string");
  });
});
