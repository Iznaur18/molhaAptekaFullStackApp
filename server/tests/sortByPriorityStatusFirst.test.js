import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ORDER_STATUS_PENDING } from "../constants/orderConstants.js";
import {
  buildMySalesSortStage,
  buildSellerItemsPendingFirstAddFieldsStage,
  SELLER_ITEMS_PENDING_FIRST_FIELD,
} from "../services/order/buildSellerItemsPendingFirstSort.js";
import { orderRowsByIds } from "../services/order/fetchMySalesOrderPageIds.js";
import {
  compareByPriorityStatusFirst,
  sortByPriorityStatusFirst,
} from "../utils/sortByPriorityStatusFirst.js";

describe("sortByPriorityStatusFirst", () => {
  it("ставит priorityStatus выше и новее сверху внутри групп", () => {
    const rows = [
      { id: "old-pending", status: "pending", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "new-done", status: "delivered", createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "new-pending", status: "pending", createdAt: "2026-05-01T00:00:00.000Z" },
      { id: "old-done", status: "shipped", createdAt: "2026-02-01T00:00:00.000Z" },
    ];

    const sorted = sortByPriorityStatusFirst(rows, {
      priorityStatus: ORDER_STATUS_PENDING,
    });

    assert.deepEqual(
      sorted.map((row) => row.id),
      ["new-pending", "old-pending", "new-done", "old-done"],
    );
  });

  it("compare: равный статус → новее первым", () => {
    const cmp = compareByPriorityStatusFirst(
      { status: "pending", createdAt: "2026-01-01T00:00:00.000Z" },
      { status: "pending", createdAt: "2026-02-01T00:00:00.000Z" },
      { priorityStatus: ORDER_STATUS_PENDING },
    );
    assert.ok(cmp > 0);
  });
});

describe("buildSellerItemsPendingFirstSort", () => {
  it("addFields: 0 при pending-позиции продавца", () => {
    const productId = "507f1f77bcf86cd799439011";
    const stage = buildSellerItemsPendingFirstAddFieldsStage([productId]);
    assert.equal(stage.$addFields[SELLER_ITEMS_PENDING_FIRST_FIELD].$cond[1], 0);
    assert.equal(stage.$addFields[SELLER_ITEMS_PENDING_FIRST_FIELD].$cond[2], 1);
    assert.deepEqual(
      stage.$addFields[SELLER_ITEMS_PENDING_FIRST_FIELD].$cond[0].$anyElementTrue.$map
        .in.$and[0],
      { $in: ["$$item.productId", [productId]] },
    );
  });

  it("sort: с приоритетом и без", () => {
    assert.deepEqual(buildMySalesSortStage(true).$sort, {
      [SELLER_ITEMS_PENDING_FIRST_FIELD]: 1,
      createdAt: -1,
    });
    assert.deepEqual(buildMySalesSortStage(false).$sort, { createdAt: -1 });
  });
});

describe("orderRowsByIds", () => {
  it("сохраняет порядок id", () => {
    const rows = orderRowsByIds(["b", "a"], [
      { _id: "a", n: 1 },
      { _id: "b", n: 2 },
    ]);
    assert.deepEqual(
      rows.map((row) => row._id),
      ["b", "a"],
    );
  });
});
