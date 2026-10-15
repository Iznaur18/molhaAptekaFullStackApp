import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isMyOrdersListGroupFilter,
  isOrderInProgress,
  MY_ORDERS_LIST_GROUP_FILTERS,
  orderMatchesStatusFilter,
} from "../dist/index.js";

const order = (id, status, itemStatuses = [status]) => ({
  id,
  status,
  items: itemStatuses.map((itemStatus) => ({ status: itemStatus })),
});

const ORDERS = [
  order("pending", "pending"),
  order("shipped", "shipped"),
  order("partly", "shipped", ["confirmed", "shipped"]),
  order("confirmed", "confirmed"),
  order("cancelled", "cancelled"),
  order("returned", "returned"),
];

const ids = (filter) =>
  ORDERS.filter((row) => orderMatchesStatusFilter(row, filter)).map((row) => row.id);

describe("группы фильтра списков заказов", () => {
  it("пустой фильтр — все заказы", () => {
    assert.equal(ids("").length, ORDERS.length);
  });

  it("«В работе» — всё, что ещё не закрыто, включая частично полученные", () => {
    assert.deepEqual(ids("in_progress"), ["pending", "shipped", "partly"]);
  });

  it("«Завершённые» — получение подтверждено", () => {
    assert.deepEqual(ids("done"), ["confirmed"]);
  });

  it("«Отменённые» — отменён или вернулся продавцу", () => {
    assert.deepEqual(ids("closed"), ["cancelled", "returned"]);
  });

  it("точный статус — только он", () => {
    assert.deepEqual(ids("shipped"), ["shipped", "partly"]);
  });

  it("группа и точный статус различаются", () => {
    assert.deepEqual(MY_ORDERS_LIST_GROUP_FILTERS, ["in_progress", "done", "closed"]);
    assert.equal(isMyOrdersListGroupFilter("done"), true);
    assert.equal(isMyOrdersListGroupFilter("shipped"), false);
    assert.equal(isMyOrdersListGroupFilter(""), false);
    assert.equal(isMyOrdersListGroupFilter("toString"), false);
  });

  it("отменённый заказ не «в работе», даже если строки не закрыты", () => {
    assert.equal(isOrderInProgress(order("x", "cancelled", ["pending"])), false);
  });
});
