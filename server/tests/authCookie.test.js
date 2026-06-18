import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";
import {
  getAuthTokenFromRequest,
  getRefreshTokenFromRequest,
} from "../utils/authCookie.js";

describe("getRefreshTokenFromRequest", () => {
  it("prefers body refreshToken over stale cookie", () => {
    const token = getRefreshTokenFromRequest({
      cookies: { [REFRESH_COOKIE_NAME]: "stale-cookie-token" },
      body: { refreshToken: "fresh-body-token" },
    });

    assert.equal(token, "fresh-body-token");
  });

  it("falls back to cookie when body is missing", () => {
    const token = getRefreshTokenFromRequest({
      cookies: { [REFRESH_COOKIE_NAME]: "cookie-only-token" },
      body: {},
    });

    assert.equal(token, "cookie-only-token");
  });

  it("returns null when neither source has a token", () => {
    assert.equal(getRefreshTokenFromRequest({ cookies: {}, body: {} }), null);
    assert.equal(
      getRefreshTokenFromRequest({
        cookies: { [REFRESH_COOKIE_NAME]: "   " },
        body: { refreshToken: "" },
      }),
      null,
    );
  });
});

describe("getAuthTokenFromRequest", () => {
  it("prefers cookie over Authorization bearer", () => {
    const token = getAuthTokenFromRequest({
      cookies: { [AUTH_COOKIE_NAME]: "cookie-access" },
      headers: { authorization: "Bearer bearer-access" },
    });

    assert.equal(token, "cookie-access");
  });
});
