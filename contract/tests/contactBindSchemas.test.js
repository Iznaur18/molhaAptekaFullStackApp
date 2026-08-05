import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailBindConfirmBodySchema,
  emailBindRequestBodySchema,
  phoneBindConfirmBodySchema,
} from "@molha/api-contract";

describe("contact bind contracts", () => {
  it("emailBindRequestBodySchema accepts email", () => {
    const parsed = emailBindRequestBodySchema.parse({ email: "a@b.co" });
    assert.equal(parsed.email, "a@b.co");
  });

  it("emailBindRequestBodySchema rejects bad email", () => {
    assert.throws(() => emailBindRequestBodySchema.parse({ email: "nope" }));
  });

  it("emailBindConfirmBodySchema requires 6 digits", () => {
    assert.equal(emailBindConfirmBodySchema.parse({ code: "123456" }).code, "123456");
    assert.throws(() => emailBindConfirmBodySchema.parse({ code: "12" }));
  });

  it("phoneBindConfirmBodySchema still requires 6 digits", () => {
    assert.equal(phoneBindConfirmBodySchema.parse({ code: "654321" }).code, "654321");
  });
});
