import assert from "node:assert/strict";
import test from "node:test";

test("partnerProgram convert schema removed from contract surface", async () => {
  const contract = await import("../src/index.js");
  assert.equal("convertPartnerBalanceBodySchema" in contract, false);
  assert.equal("CONVERT_PARTNER_BALANCE_AMOUNT_MAX" in contract, false);
  assert.equal("CONVERT_PARTNER_IDEMPOTENCY_KEY_MAX_LENGTH" in contract, false);
});
