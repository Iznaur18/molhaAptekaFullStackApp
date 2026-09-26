import { describe, expect, it } from "vitest";

import {
  groupCartLinesBySeller,
  mapCartFulfillmentToSellers,
  resolveCartFulfillmentByGroup,
} from "./groupCartLinesBySeller.js";

/**
 * @param {string} sellerId
 * @param {{ pickup?: boolean; delivery?: boolean; name?: string }} [flags]
 */
const line = (sellerId, { pickup = true, delivery = false, name = "Иван" } = {}) => ({
  productId: `p-${sellerId}-${pickup}-${delivery}`,
  quantity: 1,
  product: {
    productSeller: { _id: sellerId, userName: name },
    productPickupEnabled: pickup,
    productDeliveryEnabled: delivery,
  },
});

describe("группировка корзины по продавцам", () => {
  it("одно отправление на продавца", () => {
    const groups = groupCartLinesBySeller([line("s1"), line("s2"), line("s1")]);

    expect(groups).toHaveLength(2);
    expect(groups[0].sellerId).toBe("s1");
    expect(groups[0].lines).toHaveLength(2);
  });

  it("подхватывает имя продавца", () => {
    const [group] = groupCartLinesBySeller([line("s1", { name: "Пётр" })]);

    expect(group.sellerName).toBe("Пётр");
  });

  it("подхватывает аватар и флаги профиля продавца", () => {
    const [group] = groupCartLinesBySeller([
      {
        productId: "p1",
        quantity: 1,
        product: {
          productSeller: {
            _id: "s1",
            userName: "Анна",
            userAvatarUrl: "https://cdn.example/a.jpg",
            userAvatarFocus: { x: 40, y: 60 },
            isPremiumUser: true,
            isUserDataConfirmed: true,
          },
          productPickupEnabled: true,
          productDeliveryEnabled: false,
        },
      },
    ]);

    expect(group.sellerAvatarUrl).toBe("https://cdn.example/a.jpg");
    expect(group.sellerAvatarFocus).toEqual({ x: 40, y: 60 });
    expect(group.isPremiumUser).toBe(true);
    expect(group.isUserDataConfirmed).toBe(true);
  });

  it("товар с обоими способами даёт выбор, а не только самовывоз", () => {
    const [group] = groupCartLinesBySeller([
      line("s1", { pickup: true, delivery: true }),
    ]);

    expect(group.pickupAvailable).toBe(true);
    expect(group.deliveryAvailable).toBe(true);
  });

  it("способ доступен, только если его поддерживают все товары продавца", () => {
    const [group] = groupCartLinesBySeller([
      line("s1", { pickup: true, delivery: true }),
      line("s1", { pickup: true, delivery: false }),
    ]);

    expect(group.pickupAvailable).toBe(true);
    expect(group.deliveryAvailable).toBe(false);
  });

  it("товар только с доставкой не оставляет самовывоза", () => {
    const [group] = groupCartLinesBySeller([
      line("s1", { pickup: false, delivery: true }),
    ]);

    expect(group.pickupAvailable).toBe(false);
    expect(group.defaultMethod).toBe("delivery");
  });

  it("самовывоз остаётся способом по умолчанию", () => {
    const [group] = groupCartLinesBySeller([
      line("s1", { pickup: true, delivery: true }),
    ]);

    expect(group.defaultMethod).toBe("pickup");
  });

  it("пустая корзина даёт пустой список", () => {
    expect(groupCartLinesBySeller([])).toEqual([]);
    expect(groupCartLinesBySeller(null)).toEqual([]);
  });
});

describe("выбор способа по продавцам", () => {
  const groups = groupCartLinesBySeller([
    line("s1", { pickup: true, delivery: true }),
    line("s2", { pickup: true, delivery: false }),
  ]);

  it("без выбора берёт дефолт группы", () => {
    expect(resolveCartFulfillmentByGroup(groups, {})).toEqual({
      s1: "pickup",
      s2: "pickup",
    });
  });

  it("смешанный заказ: у одного продавца доставка, у другого самовывоз", () => {
    expect(resolveCartFulfillmentByGroup(groups, { s1: "delivery" })).toEqual({
      s1: "delivery",
      s2: "pickup",
    });
  });

  it("недоступный выбор откатывается на дефолт", () => {
    expect(
      resolveCartFulfillmentByGroup(groups, { s2: "delivery" }).s2,
      "у s2 доставки нет — сохранившийся выбор не должен уйти на сервер",
    ).toBe("pickup");
  });

  it("продавца без единого доступного способа в заказ не кладём", () => {
    const broken = groupCartLinesBySeller([
      line("s3", { pickup: false, delivery: false }),
    ]);

    expect(resolveCartFulfillmentByGroup(broken, {})).toEqual({});
  });
  it("товар с ЛОБО даёт доставку, хотя старые флаги сняты", () => {
    const [group] = groupCartLinesBySeller([
      {
        productId: "p-lobo",
        quantity: 1,
        product: {
          productSeller: { _id: "s1", userName: "Иван" },
          productPickupEnabled: false,
          productDeliveryEnabled: false,
          productCourierDeliveryEnabled: false,
          productDeliveryCarrier: "lobo",
        },
      },
    ]);

    expect(group.deliveryAvailable).toBe(true);
    expect(group.courierDelivery).toBe(false);
  });
});

describe("продавец с товарами разных служб доставки", () => {
  /**
   * @param {string} id
   * @param {string} carrier
   * @param {{ pickup?: boolean }} [options]
   */
  const carrierLine = (id, carrier, { pickup = true } = {}) => ({
    productId: id,
    quantity: 1,
    product: {
      productSeller: { _id: "s1", userName: "Иван" },
      productPickupEnabled: pickup,
      productDeliveryCarrier: carrier,
      productDeliveryEnabled: carrier === "seller",
      productCourierDeliveryEnabled: carrier === "gitorg_courier",
    },
  });

  it("делится на группы по службе — каждая оформляется своим заказом", () => {
    const groups = groupCartLinesBySeller([
      carrierLine("p1", "seller"),
      carrierLine("p2", "lobo"),
      carrierLine("p3", "seller"),
    ]);

    expect(groups.map((group) => group.groupKey)).toEqual(["s1:seller", "s1:lobo"]);
    expect(groups.map((group) => group.sellerId)).toEqual(["s1", "s1"]);
    expect(groups[0].lines.map((row) => row.productId)).toEqual(["p1", "p3"]);
    expect(groups[0].splitCarrier).toBe("seller");
    expect(groups[1].deliveryCarrier).toBe("lobo");
  });

  it("курьерская группа остаётся курьерской, а не «mixed»", () => {
    const groups = groupCartLinesBySeller([
      carrierLine("p1", "gitorg_courier"),
      carrierLine("p2", "lobo"),
    ]);
    const courier = groups.find((group) => group.splitCarrier === "gitorg_courier");

    expect(courier?.courierDelivery).toBe(true);
    expect(courier?.deliveryCarrier).toBe("gitorg_courier");
  });

  it("товары без доставки у разделённого продавца — отдельной группой самовывоза", () => {
    const groups = groupCartLinesBySeller([
      carrierLine("p1", "seller"),
      carrierLine("p2", "lobo"),
      {
        productId: "p3",
        quantity: 1,
        product: {
          productSeller: { _id: "s1", userName: "Иван" },
          productPickupEnabled: true,
        },
      },
    ]);
    const pickupOnly = groups.find((group) => group.groupKey === "s1:pickup");

    expect(pickupOnly?.splitCarrier).toBe("pickup");
    expect(pickupOnly?.deliveryAvailable).toBe(false);
  });

  it("одна служба — продавец не делится", () => {
    const groups = groupCartLinesBySeller([
      carrierLine("p1", "lobo"),
      carrierLine("p2", "lobo"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].groupKey).toBe("s1");
    expect(groups[0].splitCarrier).toBeNull();
  });

  it("способ выбирается на группу, а на сервер уходит по продавцу", () => {
    const groups = groupCartLinesBySeller([
      carrierLine("p1", "seller"),
      carrierLine("p2", "lobo"),
    ]);
    const byGroup = resolveCartFulfillmentByGroup(groups, { "s1:lobo": "delivery" });

    expect(byGroup).toEqual({ "s1:seller": "pickup", "s1:lobo": "delivery" });
    expect(mapCartFulfillmentToSellers([groups[1]], byGroup)).toEqual({
      s1: "delivery",
    });
  });
});
