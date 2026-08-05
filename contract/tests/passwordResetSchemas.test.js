import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  passwordChangeBodySchema,
  passwordResetConfirmBodySchema,
  passwordResetRequestBodySchema,
} from "@molha/api-contract";

describe("password reset / change contracts", () => {
  it("passwordResetRequestBodySchema accepts email only", () => {
    const parsed = passwordResetRequestBodySchema.parse({ email: "a@b.co" });
    assert.equal(parsed.email, "a@b.co");
    assert.equal(parsed.phoneNumber, undefined);
  });

  it("passwordResetRequestBodySchema accepts phone only", () => {
    const parsed = passwordResetRequestBodySchema.parse({
      phoneNumber: "89123456789",
    });
    assert.equal(parsed.phoneNumber, "+79123456789");
    assert.equal(parsed.email, undefined);
  });

  it("passwordResetRequestBodySchema rejects both or neither", () => {
    assert.throws(() => passwordResetRequestBodySchema.parse({}));
    assert.throws(() =>
      passwordResetRequestBodySchema.parse({
        email: "a@b.co",
        phoneNumber: "89123456789",
      }),
    );
  });

  it("passwordResetConfirmBodySchema requires code + matching passwords", () => {
    const parsed = passwordResetConfirmBodySchema.parse({
      email: "a@b.co",
      code: "123456",
      newPassword: "secret1",
      newPasswordConfirm: "secret1",
    });
    assert.equal(parsed.code, "123456");
    assert.throws(() =>
      passwordResetConfirmBodySchema.parse({
        email: "a@b.co",
        code: "12",
        newPassword: "secret1",
        newPasswordConfirm: "secret1",
      }),
    );
    assert.throws(() =>
      passwordResetConfirmBodySchema.parse({
        email: "a@b.co",
        code: "123456",
        newPassword: "secret1",
        newPasswordConfirm: "other",
      }),
    );
  });

  it("passwordChangeBodySchema requires matching passwords", () => {
    const parsed = passwordChangeBodySchema.parse({
      currentPassword: "oldpass",
      newPassword: "newpass",
      newPasswordConfirm: "newpass",
    });
    assert.equal(parsed.newPassword, "newpass");
    assert.throws(() =>
      passwordChangeBodySchema.parse({
        currentPassword: "oldpass",
        newPassword: "newpass",
        newPasswordConfirm: "nope",
      }),
    );
  });
});
