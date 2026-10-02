import { describe, expect, it } from "vitest";

import { filterMyOrders } from "./filterMyOrders.js";

/** @param {string} id @param {string} status */
const order = (id, status) => ({
  _id: id,
  status,
  items: [{ status }],
});

const ORDERS = [
  order("pending", "pending"),
  order("shipped", "shipped"),
  order("confirmed", "confirmed"),
  order("cancelled", "cancelled"),
  order("returned", "returned"),
];

/** @param {string} status */
const ids = (status) => filterMyOrders(ORDERS, { status }).map((row) => row._id);

describe("группы фильтра «Моих покупок»", () => {
  it("«В работе» — всё, что ещё не закрыто", () => {
    expect(ids("in_progress")).toEqual(["pending", "shipped"]);
  });

  it("«Завершённые» — получение подтверждено", () => {
    expect(ids("done")).toEqual(["confirmed"]);
  });

  it("«Отменённые» — отмена и возврат", () => {
    expect(ids("closed")).toEqual(["cancelled", "returned"]);
  });

  it("точный статус из «Ещё статусы» по-прежнему работает", () => {
    expect(ids("shipped")).toEqual(["shipped"]);
    expect(ids("")).toHaveLength(ORDERS.length);
  });
});
