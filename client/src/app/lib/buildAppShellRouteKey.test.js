import { describe, expect, it } from "vitest";

import { buildAppShellRouteKey } from "./buildAppShellRouteKey.js";

describe("buildAppShellRouteKey", () => {
  it("keeps catalog and product details on one key", () => {
    expect(buildAppShellRouteKey({ pathname: "/", search: "" })).toBe(
      "catalog-product-shell",
    );
    expect(buildAppShellRouteKey({ pathname: "/catalog", search: "?sort=newest" })).toBe(
      "catalog-product-shell",
    );
    expect(
      buildAppShellRouteKey({
        pathname: "/product/507f1f77bcf86cd799439011",
        search: "",
      }),
    ).toBe("catalog-product-shell");
  });

  it("keys other routes by path+search", () => {
    expect(buildAppShellRouteKey({ pathname: "/basket", search: "" })).toBe("/basket");
    expect(buildAppShellRouteKey({ pathname: "/faq", search: "?x=1" })).toBe("/faq?x=1");
  });
});
