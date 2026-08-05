import { beforeEach, describe, expect, it } from "vitest";

import {
  clearRegisterFormDraft,
  persistRegisterFormDraft,
  readRegisterFormDraft,
} from "./registerFormDraftStorage.js";

describe("registerFormDraftStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("round-trips form draft including passwords and consent", () => {
    persistRegisterFormDraft({
      channel: "email",
      form: {
        email: "a@b.co",
        phoneNumber: "",
        password: "secret1",
        passwordConfirm: "secret1",
        userName: "alice",
      },
      termsAccepted: true,
      personalDataConsentAccepted: false,
    });

    const draft = readRegisterFormDraft();
    expect(draft?.form.email).toBe("a@b.co");
    expect(draft?.form.password).toBe("secret1");
    expect(draft?.form.userName).toBe("alice");
    expect(draft?.termsAccepted).toBe(true);
    expect(draft?.personalDataConsentAccepted).toBe(false);

    clearRegisterFormDraft();
    expect(readRegisterFormDraft()).toBeNull();
  });
});
