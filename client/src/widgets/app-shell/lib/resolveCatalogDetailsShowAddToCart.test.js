import { describe, expect, it } from "vitest";

import { resolveCatalogDetailsShowAddToCart } from "./resolveCatalogDetailsShowAddToCart.js";

const product = {
  _id: "p1",
  productSeller: { _id: "seller-1" },
  productIsAvailable: true,
};

describe("resolveCatalogDetailsShowAddToCart", () => {
  it("allows add to cart on raffle products route for non-seller", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product,
        pathname: "/raffle/raffle-42",
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(true);
  });

  it("blocks add to cart on seller products route", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product,
        pathname: "/seller/seller-1",
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(false);
  });

  it("blocks add to cart for own product", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product: { ...product, productSeller: { _id: "buyer-1" } },
        pathname: "/raffle/raffle-42",
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(false);
  });
});
