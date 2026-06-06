import assert from "node:assert/strict";
import test from "node:test";

import { EMAIL_VERIFICATION_CODE_LENGTH } from "../constants/emailVerificationConstants.js";
import { generateEmailVerificationCode } from "../utils/emailVerification.js";

test("generateEmailVerificationCode returns numeric code with fixed length", () => {
  const code = generateEmailVerificationCode();
  assert.match(code, new RegExp(`^\\d{${EMAIL_VERIFICATION_CODE_LENGTH}}$`));
});
