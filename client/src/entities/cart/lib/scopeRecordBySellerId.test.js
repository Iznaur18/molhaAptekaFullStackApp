import { describe, expect, it } from "vitest";

import { scopeRecordBySellerId } from "./scopeRecordBySellerId.js";

describe("scopeRecordBySellerId", () => {
  it("возвращает весь record без sellerId", () => {
    const record = { a: "pickup", b: "delivery" };
    expect(scopeRecordBySellerId(record, null)).toEqual(record);
  });

  it("оставляет только выбранного продавца", () => {
    expect(
      scopeRecordBySellerId({ a: "pickup", b: "delivery" }, "b"),
    ).toEqual({ b: "delivery" });
  });

  it("пустой объект, если ключа нет", () => {
    expect(scopeRecordBySellerId({ a: 100 }, "missing")).toEqual({});
  });
});
