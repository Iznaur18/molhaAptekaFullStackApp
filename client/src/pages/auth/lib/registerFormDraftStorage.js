const REGISTER_FORM_DRAFT_STORAGE_KEY = "izibuy.registerFormDraft.v1";

/**
 * @typedef {{
 *   channel: "email" | "phone";
 *   form: {
 *     email: string;
 *     phoneNumber: string;
 *     password: string;
 *     passwordConfirm: string;
 *     userName: string;
 *   };
 *   termsAccepted: boolean;
 *   personalDataConsentAccepted: boolean;
 * }} RegisterFormDraft
 */

/**
 * @returns {RegisterFormDraft | null}
 */
export function readRegisterFormDraft() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(REGISTER_FORM_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const channel = parsed.channel === "phone" ? "phone" : "email";
    const form = parsed.form && typeof parsed.form === "object" ? parsed.form : {};
    return {
      channel,
      form: {
        email: typeof form.email === "string" ? form.email : "",
        phoneNumber: typeof form.phoneNumber === "string" ? form.phoneNumber : "",
        password: typeof form.password === "string" ? form.password : "",
        passwordConfirm:
          typeof form.passwordConfirm === "string" ? form.passwordConfirm : "",
        userName: typeof form.userName === "string" ? form.userName : "",
      },
      termsAccepted: parsed.termsAccepted === true,
      personalDataConsentAccepted: parsed.personalDataConsentAccepted === true,
    };
  } catch {
    return null;
  }
}

/**
 * @param {RegisterFormDraft} draft
 */
export function persistRegisterFormDraft(draft) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(REGISTER_FORM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

export function clearRegisterFormDraft() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(REGISTER_FORM_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
