import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PHONE_CHANGE_REQUIRES_OTP_MESSAGE } from "../constants/phoneVerificationConstants.js";
import { EMAIL_CHANGE_REQUIRES_OTP_MESSAGE } from "../constants/emailVerificationConstants.js";

describe("contact change OTP messages", () => {
  it("phone change requires otp copy is set", () => {
    assert.match(PHONE_CHANGE_REQUIRES_OTP_MESSAGE, /SMS/i);
  });

  it("email change requires otp copy is set", () => {
    assert.match(EMAIL_CHANGE_REQUIRES_OTP_MESSAGE, /email/i);
  });
});
