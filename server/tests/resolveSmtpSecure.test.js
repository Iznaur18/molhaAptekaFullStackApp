import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveSmtpSecure } from "../utils/resolveSmtpSecure.js";

describe("resolveSmtpSecure", () => {
  it("uses implicit TLS for 465 and Selectel 1127", () => {
    assert.equal(resolveSmtpSecure(465, undefined), true);
    assert.equal(resolveSmtpSecure(1127, undefined), true);
  });

  it("uses STARTTLS for 587 and Selectel 1126", () => {
    assert.equal(resolveSmtpSecure(587, undefined), false);
    assert.equal(resolveSmtpSecure(1126, undefined), false);
  });

  it("honors SMTP_SECURE override", () => {
    assert.equal(resolveSmtpSecure(587, "true"), true);
    assert.equal(resolveSmtpSecure(1127, "false"), false);
    assert.equal(resolveSmtpSecure(1126, "1"), true);
    assert.equal(resolveSmtpSecure(465, "0"), false);
  });
});
