import { describe, expect, it } from "vitest";

import {
  isProductDetailsPath,
  parseProductIdFromPathname,
  shouldProxyProductPathToApi,
} from "./productDetailsPaths.js";

const PRODUCT_ID = "6a5f4784728ddac6b18324ad";

describe("productDetailsPaths", () => {
  it("parseProductIdFromPathname: mongo id in SPA path", () => {
    expect(parseProductIdFromPathname(`/product/${PRODUCT_ID}`)).toBe(PRODUCT_ID);
  });

  it("parseProductIdFromPathname: rejects API-like single segments", () => {
    expect(parseProductIdFromPathname("/product/my")).toBeNull();
    expect(parseProductIdFromPathname("/product/categories/roots")).toBeNull();
  });

  it("isProductDetailsPath", () => {
    expect(isProductDetailsPath(`/product/${PRODUCT_ID}`)).toBe(true);
    expect(isProductDetailsPath("/product/my")).toBe(false);
  });

  it("shouldProxyProductPathToApi: SPA vs API under /product", () => {
    expect(shouldProxyProductPathToApi("/product")).toBe(true);
    expect(shouldProxyProductPathToApi(`/product/${PRODUCT_ID}`)).toBe(false);
    expect(shouldProxyProductPathToApi(`/product/${PRODUCT_ID}/catalog`)).toBe(
      true,
    );
    expect(shouldProxyProductPathToApi("/product/my")).toBe(true);
    expect(shouldProxyProductPathToApi("/product/categories/roots")).toBe(true);
  });
});
