import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_TOKEN_TTL_DAYS,
} from "../constants/authCookieConstants.js";
import { signRefreshToken, verifyRefreshToken } from "../services/auth/authTokens.js";

describe("refresh token TTL ~365d", () => {
  it("cookie maxAge matches TTL days", () => {
    assert.equal(REFRESH_TOKEN_TTL_DAYS, 365);
    assert.equal(
      REFRESH_COOKIE_MAX_AGE_MS,
      REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
  });

  it("JWT exp is ~365 days from now", () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-ttl-check-32chars!!";
    const token = signRefreshToken("507f1f77bcf86cd799439011", 0);
    const decoded = verifyRefreshToken(token);
    const expMs = decoded.exp * 1000;
    const days = (expMs - Date.now()) / (24 * 60 * 60 * 1000);
    assert.ok(days > 360 && days < 366, `expected ~365d, got ${days}`);
  });
});
