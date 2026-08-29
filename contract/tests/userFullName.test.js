import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { updateProfileBodySchema, USER_FULL_NAME_MAX_LENGTH } from "../src/userProfile.js";

describe("userFullName", () => {
  it("accepts trimmed display name", () => {
    const parsed = updateProfileBodySchema.parse({
      userFullName: "  Иван   Иванов  ",
    });
    assert.equal(parsed.userFullName, "Иван Иванов");
  });

  it("clears empty display name", () => {
    const parsed = updateProfileBodySchema.parse({ userFullName: "" });
    assert.equal(parsed.userFullName, null);
  });

  it("rejects too long display name", () => {
    const tooLong = "а".repeat(USER_FULL_NAME_MAX_LENGTH + 1);
    assert.throws(() => updateProfileBodySchema.parse({ userFullName: tooLong }));
  });
});
