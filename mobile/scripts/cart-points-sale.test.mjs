import assert from "node:assert/strict";
import { test } from "node:test";

import { groupCartLinesBySeller } from "@izibuy/shared-lib";

import { selectCartCheckoutSummary } from "../entities/cart/lib/selectCartCheckoutSummary.ts";
import { selectCartLines } from "../entities/cart/lib/selectCartLines.ts";
import {
  getProductCartQuantityLimit,
  getProductPurchaseLimit,
} from "../entities/product/lib/getProductPurchaseLimit.ts";

const pointsProduct = {
  _id: "p1",
  productName: "Кружка",
  productPrice: 900,
  productSeller: { _id: "s1", userName: "Иван" },
  productIsAvailable: true,
  productPickupAddress: "Грозный, ул. Мира, 7",
  productStockQuantity: 10,
  productPointsSaleEnabled: true,
  productPointsPrice: 300,
  productPointsPerBuyerLimit: 2,
};

const rubProduct = { ...pointsProduct, _id: "p2", productPointsSaleEnabled: false };

test("товар за баллы в корзине: рублей нет, сумма в баллах", () => {
  const { lines } = selectCartLines({ p1: 2 }, [pointsProduct]);
  const [line] = lines;

  assert.equal(line.isPointsSale, true);
  assert.equal(line.lineTotal, 0);
  assert.equal(line.pointsLineTotal, 600);

  const summary = selectCartCheckoutSummary(lines, "buyer");
  assert.equal(summary.selectedTotal, 0);
  assert.equal(summary.selectedPointsTotal, 600);
});

test("товары за баллы того же продавца — своя группа корзины", () => {
  const { lines } = selectCartLines({ p1: 1, p2: 1 }, [pointsProduct, rubProduct]);

  const groups = groupCartLinesBySeller(lines);

  assert.deepEqual(
    groups.map((group) => [group.cartGroupId, group.paidWithLoyaltyPoints]),
    [
      ["s1:points", true],
      ["s1", false],
    ],
  );
});

test("лимит в одни руки ограничивает корзину, но не бейдж остатка", () => {
  assert.equal(getProductCartQuantityLimit(pointsProduct), 2);
  assert.equal(getProductPurchaseLimit(pointsProduct), 10);
});
