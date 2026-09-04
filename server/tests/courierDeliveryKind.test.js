import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const { buildStoredShipments } = await import(
  "../services/order/orderShipments.js"
);
const { createProductBodySchema } = await import("@molha/api-contract");

const SELLER_A = "aaaaaaaaaaaaaaaaaaaaaaaa";
const SELLER_B = "bbbbbbbbbbbbbbbbbbbbbbbb";

const line = (sellerId) => ({ sellerIdAtOrder: sellerId, status: "pending" });

describe("вид доставки на отправлении", () => {
  it("курьерское отправление помечается", () => {
    const [shipment] = buildStoredShipments(
      [line(SELLER_A)],
      { [SELLER_A]: "delivery" },
      "pickup",
      { [SELLER_A]: 250 },
      { [SELLER_A]: true },
    );

    assert.equal(shipment.courierDelivery, true);
  });

  it("доставка продавцом курьерской не считается", () => {
    const [shipment] = buildStoredShipments(
      [line(SELLER_A)],
      { [SELLER_A]: "delivery" },
      "pickup",
      { [SELLER_A]: 250 },
      { [SELLER_A]: false },
    );

    assert.equal(
      shipment.courierDelivery,
      false,
      "иначе «Обзор» предложит курьерам заказ продавца, который возит сам",
    );
  });

  it("самовывоз курьерским не бывает", () => {
    const [shipment] = buildStoredShipments(
      [line(SELLER_A)],
      { [SELLER_A]: "pickup" },
      "pickup",
      null,
      { [SELLER_A]: true },
    );

    assert.equal(shipment.courierDelivery, false);
  });

  it("у разных продавцов вид свой", () => {
    const shipments = buildStoredShipments(
      [line(SELLER_A), line(SELLER_B)],
      { [SELLER_A]: "delivery", [SELLER_B]: "delivery" },
      "pickup",
      null,
      { [SELLER_A]: true, [SELLER_B]: false },
    );
    const byId = Object.fromEntries(
      shipments.map((s) => [s.sellerId, s.courierDelivery]),
    );

    assert.equal(byId[SELLER_A], true);
    assert.equal(byId[SELLER_B], false);
  });

  it("без карты видов всё считается доставкой продавцом", () => {
    const [shipment] = buildStoredShipments(
      [line(SELLER_A)],
      { [SELLER_A]: "delivery" },
      "pickup",
    );

    assert.equal(
      shipment.courierDelivery,
      false,
      "безопасный дефолт: чужим курьерам заказ без спроса не отдаём",
    );
  });

  it("carrier и payout не путаются по позиции аргументов", () => {
    const [shipment] = buildStoredShipments(
      [line(SELLER_A)],
      { [SELLER_A]: "delivery" },
      "pickup",
      { [SELLER_A]: 100 },
      { [SELLER_A]: false },
      { [SELLER_A]: "+7 900 000-00-00" },
      { [SELLER_A]: "seller" },
    );

    assert.equal(shipment.deliveryCarrier, "seller");
    assert.equal(shipment.sellerPayoutRequisites, "+7 900 000-00-00");
    assert.equal(shipment.courierDelivery, false);
  });
});

describe("взаимоисключение способов на товаре", () => {
  const base = {
    productName: "Тестовый товар для проверки правил",
    productDescription: "Описание достаточной длины для прохождения валидации схемы товара",
    productPrice: 1000,
    productImageUrls: ["/uploads/test.webp"],
    productPickupAddress: "г Москва, ул Тестовая, д 1",
    productPickupLat: 55.75,
    productPickupLon: 37.62,
    productListingOrigin: "own",
  };

  it("нельзя выбрать и доставку продавцом, и курьеров", () => {
    const result = createProductBodySchema.safeParse({
      ...base,
      productDeliveryEnabled: true,
      productCourierDeliveryEnabled: true,
    });

    assert.equal(result.success, false);
    assert.ok(
      result.error.issues.some((i) =>
        i.path.includes("productCourierDeliveryEnabled"),
      ),
      "смешение сделало бы непонятным, кому предлагать отправление",
    );
  });

  it("только курьеры — можно", () => {
    const result = createProductBodySchema.safeParse({
      ...base,
      productPickupEnabled: false,
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: true,
    });

    assert.equal(result.success, true, result.error?.issues?.[0]?.message);
  });

  it("курьеры вместе с самовывозом — можно", () => {
    const result = createProductBodySchema.safeParse({
      ...base,
      productPickupEnabled: true,
      productCourierDeliveryEnabled: true,
    });

    assert.equal(result.success, true, result.error?.issues?.[0]?.message);
  });

  it("ни одного способа по-прежнему нельзя", () => {
    const result = createProductBodySchema.safeParse({
      ...base,
      productPickupEnabled: false,
      productDeliveryEnabled: false,
      productCourierDeliveryEnabled: false,
    });

    assert.equal(result.success, false);
  });
});
