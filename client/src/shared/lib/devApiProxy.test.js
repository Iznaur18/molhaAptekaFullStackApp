import { describe, expect, it } from "vitest";

import { DEV_API_PROXY_PREFIXES, shouldProxyToApi } from "./devApiProxy.js";

describe("shouldProxyToApi", () => {
  it("proxies /users-loyalty-raffle through the /user prefix match", () => {
    expect(shouldProxyToApi("/user", "/users-loyalty-raffle")).toBe(true);
    expect(shouldProxyToApi("/user", "/users-loyalty-raffle/")).toBe(true);
  });

  it("does not treat /user-list as API", () => {
    expect(shouldProxyToApi("/user", "/user-list")).toBe(false);
  });

  it("proxies real /user API paths", () => {
    expect(shouldProxyToApi("/user", "/user")).toBe(true);
    expect(shouldProxyToApi("/user", "/user/me")).toBe(true);
  });

  it("lists users-loyalty-raffle among proxy prefixes", () => {
    expect(DEV_API_PROXY_PREFIXES).toContain("/users-loyalty-raffle");
    expect(DEV_API_PROXY_PREFIXES).toContain("/seller-shelf");
    expect(DEV_API_PROXY_PREFIXES).toContain("/seller");
    expect(DEV_API_PROXY_PREFIXES).toContain("/faq");
    expect(DEV_API_PROXY_PREFIXES.indexOf("/seller-shelf")).toBeLessThan(
      DEV_API_PROXY_PREFIXES.indexOf("/seller"),
    );
    expect(DEV_API_PROXY_PREFIXES.indexOf("/uploads")).toBeLessThan(
      DEV_API_PROXY_PREFIXES.indexOf("/upload"),
    );
  });

  it("keeps SPA /faq and proxies /faq/item-links to API", () => {
    expect(shouldProxyToApi("/faq", "/faq")).toBe(false);
    expect(shouldProxyToApi("/faq", "/faq/item-links")).toBe(true);
    expect(shouldProxyToApi("/faq", "/faq/item-links/register")).toBe(true);
  });

  it("proxies /seller/:id only for link-preview bots", () => {
    const path = "/seller/6a871e02e4b218aa47757078";
    expect(shouldProxyToApi("/seller", path, "text/html")).toBe(false);
    expect(shouldProxyToApi("/seller", path, "text/html", "WhatsApp/2.0")).toBe(
      true,
    );
    expect(
      shouldProxyToApi("/seller", "/seller-shelf/me", "text/html", "WhatsApp/2.0"),
    ).toBe(false);
  });
});