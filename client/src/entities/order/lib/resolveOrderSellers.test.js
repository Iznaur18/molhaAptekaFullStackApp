import { describe, expect, it } from "vitest";

import { resolveOrderSellers } from "./resolveOrderSellers.js";

describe("resolveOrderSellers", () => {
  it("returns unique sellers from populated line items", () => {
    const sellers = resolveOrderSellers({
      items: [
        {
          productId: {
            productSeller: { _id: "s1", userName: "alice" },
          },
        },
        {
          productId: {
            productSeller: { _id: "s1", userName: "alice" },
          },
        },
        {
          productId: {
            productSeller: { _id: "s2", userName: "bob" },
          },
        },
      ],
    });

    expect(sellers.map((seller) => seller._id)).toEqual(["s1", "s2"]);
    expect(sellers[0].userName).toBe("alice");
  });

  it("keeps phone on seller payload", () => {
    const sellers = resolveOrderSellers({
      items: [
        {
          productId: {
            productSeller: {
              _id: "s1",
              userName: "alice",
              userPhoneNumber: "+79123456789",
            },
          },
        },
      ],
    });
    expect(sellers[0].userPhoneNumber).toBe("+79123456789");
  });
});
