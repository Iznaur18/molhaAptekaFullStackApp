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
    expect(DEV_API_PROXY_PREFIXES.indexOf("/uploads")).toBeLessThan(
      DEV_API_PROXY_PREFIXES.indexOf("/upload"),
    );
  });
});
