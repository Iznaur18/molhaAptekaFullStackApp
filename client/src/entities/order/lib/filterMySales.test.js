import { describe, expect, it } from "vitest";

import { filterMySales, isMySalesGroupFilter } from "./filterMySales.js";

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

/** @param {string} statusFilter */
const ids = (statusFilter) =>
  filterMySales(ORDERS, { statusFilter }).map((row) => row._id);

describe("группы фильтра «Моих продаж»", () => {
  it("«В работе» — всё, что ещё не закрыто", () => {
    expect(ids("in_progress")).toEqual(["pending", "shipped"]);
  });

  it("«Завершённые» — получение подтверждено", () => {
    expect(ids("done")).toEqual(["confirmed"]);
  });

  it("«Отменённые» — отмена и возврат", () => {
    expect(ids("closed")).toEqual(["cancelled", "returned"]);
  });

  it("точный статус не режет список: им уже отфильтрован ответ сервера", () => {
    expect(ids("shipped")).toHaveLength(ORDERS.length);
    expect(ids("")).toHaveLength(ORDERS.length);
  });

  it("отличает группу от точного статуса", () => {
    expect(isMySalesGroupFilter("done")).toBe(true);
    expect(isMySalesGroupFilter("shipped")).toBe(false);
    expect(isMySalesGroupFilter("")).toBe(false);
  });
});
