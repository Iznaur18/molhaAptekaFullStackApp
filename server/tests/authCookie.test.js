import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACCESS_TOKEN_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
} from "../constants/authCookieConstants.js";
import {
  getAuthTokenFromRequest,
  getRefreshTokenFromRequest,
} from "../utils/authCookie.js";

describe("access cookie transport lifetime", () => {
  // Регрессия «выкидывает после ~часа отсутствия»: access-cookie должна жить
  // столько же, сколько refresh. Иначе после >1ч простоя /auth/me приходит без
  // токена → 200 «гость», а клиент делает refresh только на 401 (см.
  // authCookieConstants.js и packages/shared-api).
  it("access cookie maxAge matches refresh cookie maxAge", () => {
    assert.equal(ACCESS_TOKEN_MAX_AGE_MS, REFRESH_COOKIE_MAX_AGE_MS);
  });

  it("access cookie clearly outlives the 1h access JWT", () => {
    const oneHourMs = 60 * 60 * 1000;
    assert.ok(
      ACCESS_TOKEN_MAX_AGE_MS > oneHourMs,
      `access cookie maxAge (${ACCESS_TOKEN_MAX_AGE_MS}) must exceed 1h`,
    );
  });
});

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
