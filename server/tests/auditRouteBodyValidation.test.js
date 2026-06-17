import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { auditRouteBodyValidation } from "../scripts/auditRouteBodyValidation.js";

describe("auditRouteBodyValidation", () => {
  it("reports zero gaps after allowlist and emptyBodyValidation routes", () => {
    const { gaps } = auditRouteBodyValidation();
    assert.deepEqual(gaps, []);
  });
});
