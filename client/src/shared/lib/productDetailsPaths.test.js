import { describe, expect, it } from "vitest";

import {
  isProductDetailsPath,
  parseProductIdFromPathname,
  shouldProxyProductPathToApi,
  shouldServeProductDetailsAsSpa,
} from "./productDetailsPaths.js";

const PRODUCT_ID = "6a5f4784728ddac6b18324ad";
const DETAILS_PATH = `/product/${PRODUCT_ID}`;

describe("productDetailsPaths", () => {
  it("parseProductIdFromPathname: mongo id in SPA path", () => {
    expect(parseProductIdFromPathname(DETAILS_PATH)).toBe(PRODUCT_ID);
  });

  it("parseProductIdFromPathname: rejects API-like single segments", () => {
    expect(parseProductIdFromPathname("/product/my")).toBeNull();
    expect(parseProductIdFromPathname("/product/categories/roots")).toBeNull();
  });

  it("isProductDetailsPath", () => {
    expect(isProductDetailsPath(DETAILS_PATH)).toBe(true);
    expect(isProductDetailsPath("/product/my")).toBe(false);
  });

  it("shouldServeProductDetailsAsSpa: only html document accept", () => {
    expect(shouldServeProductDetailsAsSpa(DETAILS_PATH, "text/html")).toBe(true);
    expect(
      shouldServeProductDetailsAsSpa(DETAILS_PATH, "application/json, text/plain, */*"),
    ).toBe(false);
    expect(shouldServeProductDetailsAsSpa("/product/my", "text/html")).toBe(false);
    expect(
      shouldServeProductDetailsAsSpa(DETAILS_PATH, "text/html", "WhatsApp/2.0"),
    ).toBe(false);
  });

  it("shouldProxyProductPathToApi: XHR to /product/:id goes to API", () => {
    expect(shouldProxyProductPathToApi("/product")).toBe(true);
    expect(shouldProxyProductPathToApi(DETAILS_PATH)).toBe(true);
    expect(
      shouldProxyProductPathToApi(DETAILS_PATH, "application/json, text/plain, */*"),
    ).toBe(true);
    expect(shouldProxyProductPathToApi(DETAILS_PATH, "text/html")).toBe(false);
    expect(
      shouldProxyProductPathToApi(DETAILS_PATH, "text/html", "WhatsApp/2.0"),
    ).toBe(true);
    expect(shouldProxyProductPathToApi(`${DETAILS_PATH}/catalog`)).toBe(true);
    expect(shouldProxyProductPathToApi("/product/my")).toBe(true);
    expect(shouldProxyProductPathToApi("/product/categories/roots")).toBe(true);
  });
});
