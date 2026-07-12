import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("register screen requires legal consent before submit", () => {
  const registerScreen = readMobileFile("app/(auth)/register.tsx");
  const consentFields = readMobileFile("features/legal/ui/RegisterLegalConsentFields.tsx");
  const consentContent = readMobileFile("features/legal/model/registrationConsentContent.ts");
  const consentValidation = readMobileFile("features/legal/lib/isRegisterConsentComplete.ts");
  const styles = readMobileFile("shared/theme/formChromeStyles.ts");
  const layout = readMobileFile("app/_layout.tsx");

  assert.match(registerScreen, /RegisterLegalConsentFields/);
  assert.match(registerScreen, /isRegisterConsentComplete/);
  assert.match(registerScreen, /REGISTER_CONSENT_REQUIRED/);
  assert.match(registerScreen, /disabled=\{registerMutation\.isPending \|\| !isConsentComplete\}/);
  assert.match(consentFields, /accessibilityRole="checkbox"/);
  assert.match(consentFields, /\/legal\/terms/);
  assert.match(consentFields, /\/legal\/listing/);
  assert.match(consentFields, /\/legal\/privacy/);
  assert.match(consentContent, /REGISTRATION_PERSONAL_DATA_CONSENT_SUMMARY/);
  assert.match(consentValidation, /consent\.termsAccepted && consent\.personalDataConsentAccepted/);
  assert.match(styles, /consentBlock/);
  assert.match(layout, /legal\/listing/);
});
