import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  isRefreshTokenVersionValid,
  resolveUserAuthTokenVersion,
} from "../services/auth/userAuthTokenVersion.js";

describe("userAuthTokenVersion", () => {
  it("resolveUserAuthTokenVersion defaults missing to 0", () => {
    assert.equal(resolveUserAuthTokenVersion({}), 0);
    assert.equal(resolveUserAuthTokenVersion({ authTokenVersion: 2 }), 2);
  });

  it("isRefreshTokenVersionValid matches stored version", () => {
    const user = { authTokenVersion: 3 };
    assert.equal(isRefreshTokenVersionValid(3, user), true);
    assert.equal(isRefreshTokenVersionValid(2, user), false);
    assert.equal(isRefreshTokenVersionValid(undefined, user), false);
  });
});

describe("resolveLogoutUserId", () => {
  const savedJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (savedJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = savedJwtSecret;
    }
  });

  it("returns null without tokens", async () => {
    process.env.JWT_SECRET = "test-jwt-secret-min-32-chars-long";
    const { resolveLogoutUserId } = await import("../utils/resolveLogoutUserId.js");
    const userId = resolveLogoutUserId({ body: {}, headers: {} });
    assert.equal(userId, null);
  });
});
