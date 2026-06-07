import { describe, expect, it } from "vitest";

import {
  CART_ACTION_ADD,
  CART_ACTION_CLEAR,
  CART_ACTION_HYDRATE,
  CART_ACTION_REMOVE,
  CART_ACTION_SET_QUANTITY,
  cartReducer,
} from "./cartReducer.js";
import { CART_LINE_ITEM_QUANTITY_MAX, CART_MAX_DISTINCT_PRODUCTS } from "./cartConstants.js";

describe("cartReducer", () => {
  it("adds quantity and clamps to max per line", () => {
    const state = { p1: 1 };
    const next = cartReducer(state, {
      type: CART_ACTION_ADD,
      productId: "p1",
      quantity: 200,
    });
    expect(next.p1).toBe(CART_LINE_ITEM_QUANTITY_MAX);
  });

  it("refuses new product when cart is full", () => {
    const state = Object.fromEntries(
      Array.from({ length: CART_MAX_DISTINCT_PRODUCTS }, (_, i) => [`p${i}`, 1]),
    );
    const next = cartReducer(state, {
      type: CART_ACTION_ADD,
      productId: "new-product",
      quantity: 1,
    });
    expect(next).toBe(state);
    expect(next["new-product"]).toBeUndefined();
  });

  it("clamps setQuantity to minimum of 1", () => {
    const next = cartReducer({ p1: 2 }, {
      type: CART_ACTION_SET_QUANTITY,
      productId: "p1",
      quantity: 0,
    });
    expect(next).toEqual({ p1: 1 });
  });

  it("supports remove, clear and hydrate", () => {
    expect(
      cartReducer({ p1: 1, p2: 2 }, { type: CART_ACTION_REMOVE, productId: "p1" }),
    ).toEqual({ p2: 2 });
    expect(cartReducer({ p1: 1 }, { type: CART_ACTION_CLEAR })).toEqual({});
    expect(
      cartReducer({}, { type: CART_ACTION_HYDRATE, payload: { p9: 3 } }),
    ).toEqual({ p9: 3 });
  });
});
