import { describe, expect, it } from "vitest";

import {
  groupCartLinesBySeller,
  resolveCartFulfillmentBySeller,
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
    expect(resolveCartFulfillmentBySeller(groups, {})).toEqual({
      s1: "pickup",
      s2: "pickup",
    });
  });

  it("смешанный заказ: у одного продавца доставка, у другого самовывоз", () => {
    expect(resolveCartFulfillmentBySeller(groups, { s1: "delivery" })).toEqual({
      s1: "delivery",
      s2: "pickup",
    });
  });

  it("недоступный выбор откатывается на дефолт", () => {
    expect(
      resolveCartFulfillmentBySeller(groups, { s2: "delivery" }).s2,
      "у s2 доставки нет — сохранившийся выбор не должен уйти на сервер",
    ).toBe("pickup");
  });

  it("продавца без единого доступного способа в заказ не кладём", () => {
    const broken = groupCartLinesBySeller([
      line("s3", { pickup: false, delivery: false }),
    ]);

    expect(resolveCartFulfillmentBySeller(broken, {})).toEqual({});
  });
});
