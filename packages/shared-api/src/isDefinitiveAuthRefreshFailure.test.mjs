import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isDefinitiveAuthRefreshFailure } from "./isDefinitiveAuthRefreshFailure.ts";

describe("isDefinitiveAuthRefreshFailure", () => {
  it("network / no response → false", () => {
    assert.equal(isDefinitiveAuthRefreshFailure({ message: "Network Error" }), false);
    assert.equal(isDefinitiveAuthRefreshFailure({ code: "ERR_NETWORK" }), false);
  });

  it("5xx → false", () => {
    assert.equal(
      isDefinitiveAuthRefreshFailure({ response: { status: 503 } }),
      false,
    );
    assert.equal(
      isDefinitiveAuthRefreshFailure({ response: { status: 500 } }),
      false,
    );
  });

  it("401 / 403 → true", () => {
    assert.equal(
      isDefinitiveAuthRefreshFailure({ response: { status: 401 } }),
      true,
    );
    assert.equal(
      isDefinitiveAuthRefreshFailure({ response: { status: 403 } }),
      true,
    );
  });

  it("other 4xx → true", () => {
    assert.equal(
      isDefinitiveAuthRefreshFailure({ response: { status: 400 } }),
      true,
    );
  });
});
