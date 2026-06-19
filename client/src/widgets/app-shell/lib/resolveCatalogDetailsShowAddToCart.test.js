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
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(true);
  });

  it("allows add to cart on seller products route for non-seller", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product,
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(true);
  });

  it("blocks add to cart for own product", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product: { ...product, productSeller: { _id: "buyer-1" } },
        isMineMode: false,
        currentUserId: "buyer-1",
      }),
    ).toBe(false);
  });

  it("blocks add to cart in my-products mode", () => {
    expect(
      resolveCatalogDetailsShowAddToCart({
        product,
        isMineMode: true,
        currentUserId: "buyer-1",
      }),
    ).toBe(false);
  });
});
