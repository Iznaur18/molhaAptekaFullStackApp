import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEAL_REQUEST_MAX_AHEAD_MS,
  DEAL_REQUEST_TIME_IN_PAST_MESSAGE,
  DEAL_REQUEST_TIME_TOO_FAR_MESSAGE,
  acceptDealRequestBodySchema,
  createDealRequestBodySchema,
  declineDealRequestBodySchema,
  isDealRequestContactOpen,
  isSellerPhoneOpenBeforeRequest,
  resolveDealRequestActions,
  resolveDealRequestStatusForOutcome,
} from "../src/dealRequest.js";

const PRODUCT_ID = "64b000000000000000000001";
const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

describe("dealRequest contract", () => {
  it("заявка: время из строки, пустые тексты становятся пустой строкой", () => {
    const parsed = createDealRequestBodySchema.parse({
      productId: PRODUCT_ID,
      preferredAt: tomorrow(),
    });
    assert.ok(parsed.preferredAt instanceof Date);
    assert.equal(parsed.comment, "");
    assert.equal(parsed.address, "");
  });

  it("время в прошлом и слишком далёкое отклоняются с понятным текстом", () => {
    const past = createDealRequestBodySchema.safeParse({
      productId: PRODUCT_ID,
      preferredAt: new Date(Date.now() - 60_000).toISOString(),
    });
    assert.equal(past.success, false);
    assert.equal(past.error.issues[0].message, DEAL_REQUEST_TIME_IN_PAST_MESSAGE);

    const far = createDealRequestBodySchema.safeParse({
      productId: PRODUCT_ID,
      preferredAt: new Date(
        Date.now() + DEAL_REQUEST_MAX_AHEAD_MS + 3_600_000,
      ).toISOString(),
    });
    assert.equal(far.success, false);
    assert.equal(far.error.issues[0].message, DEAL_REQUEST_TIME_TOO_FAR_MESSAGE);
  });

  it("принятие и отказ работают с пустым телом", () => {
    assert.deepEqual(acceptDealRequestBodySchema.parse(undefined), {});
    assert.deepEqual(declineDealRequestBodySchema.parse(undefined), { reason: "" });
    assert.equal(
      acceptDealRequestBodySchema.safeParse({ quotedPriceRub: 0 }).success,
      false,
    );
    assert.equal(
      acceptDealRequestBodySchema.parse({ quotedPriceRub: "1500" }).quotedPriceRub,
      1500,
    );
  });

  it("действия продавца и покупателя по статусам", () => {
    const actions = (status, kind, role) =>
      resolveDealRequestActions({ status, kind, role });

    assert.deepEqual(actions("pending", "viewing", "seller"), ["accept", "decline"]);
    assert.deepEqual(actions("pending", "viewing", "buyer"), ["cancel"]);
    assert.deepEqual(actions("accepted", "service", "seller"), [
      "completed",
      "no_deal",
      "no_show",
    ]);
    assert.deepEqual(actions("accepted", "service", "buyer"), ["cancel"]);
    assert.deepEqual(actions("done", "service", "buyer"), ["confirm"]);
    assert.deepEqual(actions("done", "service", "seller"), []);
    for (const closed of ["declined", "cancelled", "expired", "completed", "no_deal"]) {
      assert.deepEqual(actions(closed, "viewing", "seller"), []);
      assert.deepEqual(actions(closed, "viewing", "buyer"), []);
    }
  });

  it("итог «состоялась»: осмотр закрывается, услуга ждёт клиента", () => {
    const status = (kind, outcome) =>
      resolveDealRequestStatusForOutcome({ kind, outcome });
    assert.equal(status("viewing", "completed"), "completed");
    assert.equal(status("service", "completed"), "done");
    assert.equal(status("service", "no_show"), "no_show");
    assert.equal(status("viewing", "no_deal"), "no_deal");
  });

  it("телефон: у осмотра открыт сразу, у услуги — после принятия", () => {
    assert.equal(isSellerPhoneOpenBeforeRequest("viewing"), true);
    assert.equal(isSellerPhoneOpenBeforeRequest("service"), false);
    assert.equal(isDealRequestContactOpen("pending"), false);
    assert.equal(isDealRequestContactOpen("accepted"), true);
    assert.equal(isDealRequestContactOpen("declined"), false);
  });
});
