import assert from "node:assert/strict";
import test from "node:test";

import { validateRuStructuredDeliveryAddress } from "../middlewares/validateRuStructuredDeliveryAddress.js";

/**
 * @param {Record<string, unknown>} body
 */
async function runMiddleware(body) {
  const mw = validateRuStructuredDeliveryAddress();
  /** @type {Record<string, unknown>} */
  const req = { body };
  /** @type {{ statusCode?: number; payload?: unknown }} */
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  let nextCalled = false;
  await mw(req, res, () => {
    nextCalled = true;
  });
  return { req, res, nextCalled };
}

test("line + flat → legacy DaData path (не structured clear)", async () => {
  const { req, res, nextCalled } = await runMiddleware({
    userAddress: "Грозный, Саратовская, д 26",
    userAddressFlat: null,
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, undefined);
  assert.ok(req.verifiedDeliveryAddress);
  assert.equal(
    /** @type {{ displayAddress: string }} */ (req.verifiedDeliveryAddress)
      .displayAddress,
    "Грозный, Саратовская, д 26",
  );
});

test("line + non-empty flat → legacy path, не 400 city/street/house", async () => {
  const { req, res, nextCalled } = await runMiddleware({
    userAddress: "Грозный, Саратовская, д 26",
    userAddressFlat: "12",
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, undefined);
  assert.ok(req.verifiedDeliveryAddress);
  assert.equal(
    /** @type {{ flat: string }} */ (req.verifiedDeliveryAddress).flat,
    "12",
  );
});

test("structured city/street/house без house → 400", async () => {
  const { res, nextCalled } = await runMiddleware({
    userAddressCity: "Грозный",
    userAddressStreet: "Саратовская",
    userAddressHouse: "",
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
});
