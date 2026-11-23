import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("auth layout tokens: column 420, pad 24, title 26, input 10/12×14, hero 32", () => {
  const layout = readMobile("shared/lib/authPageLayout.ts");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const webCss = readClient("pages/auth/ui/AuthPage.css");
  const webHero = readClient("shared/ui/AuthHeroBanner/AuthHeroBanner.css");

  assert.match(webCss, /--auth-page-column-max:\s*420px/);
  assert.match(webCss, /padding:\s*24px 24px/);
  assert.match(webCss, /\.auth-page__title \{[\s\S]*font-size:\s*26px[\s\S]*font-weight:\s*700/);
  assert.match(webCss, /padding:\s*12px 14px/);
  assert.match(webCss, /border-radius:\s*var\(--iz-control-btn-radius,\s*10px\)/);
  assert.match(webHero, /border-radius:\s*32px/);

  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /bodyPaddingX: 24/);
  assert.match(layout, /bodyPaddingTop: 24/);
  assert.match(layout, /titleFontSize: 26/);
  assert.match(layout, /inputRadius: 10/);
  assert.match(layout, /inputPaddingY: 12/);
  assert.match(layout, /inputPaddingX: 14/);
  assert.match(layout, /heroRadius: 32/);

  assert.match(styles, /maxWidth: A\.columnMaxWidth/);
  assert.match(styles, /borderRadius: A\.heroRadius/);
  assert.match(styles, /fontSize: A\.titleFontSize/);
  assert.match(styles, /fontWeight: "700"/);
  assert.doesNotMatch(styles, /useAuthFormStyles/);
});

test("auth channel btn pad matches web 0.45rem/0.65rem → 7.2/10.4", () => {
  const layout = readMobile("shared/lib/authPageLayout.ts");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const webCss = readClient("pages/auth/ui/AuthPage.css");

  assert.match(webCss, /\.auth-page__channel-btn \{[\s\S]*padding:\s*0\.45rem 0\.65rem/);
  assert.match(layout, /channelBtnPaddingY: 7\.2/);
  assert.match(layout, /channelBtnPaddingX: 10\.4/);
  assert.match(styles, /paddingVertical: A\.channelBtnPaddingY/);
  assert.match(styles, /paddingHorizontal: A\.channelBtnPaddingX/);
});

test("auth screens use AUTH_UI / RegisterLegalConsentFields from appUiCopy", () => {
  const login = readMobile("app/(auth)/login.tsx");
  const register = readMobile("app/(auth)/register.tsx");
  const forgot = readMobile("app/(auth)/forgot-password.tsx");
  const consent = readMobile("features/legal/ui/RegisterLegalConsentFields.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const webLogin = readClient("pages/auth/ui/LoginPage.jsx");
  const webRegister = readClient("pages/auth/ui/RegisterPage.jsx");

  assert.match(login, /AUTH_UI/);
  assert.match(register, /AUTH_UI/);
  assert.match(forgot, /AUTH_UI/);
  assert.match(consent, /AUTH_UI\.REGISTER_TERMS/);
  assert.match(consent, /AUTH_UI\.REGISTER_PRIVACY/);
  assert.match(copy, /export const AUTH_UI/);
  assert.match(copy, /REGISTER_CONSENT_REQUIRED/);
  assert.match(webLogin, /AUTH_UI/);
  assert.match(webRegister, /AUTH_UI/);
  assert.match(register, /RegisterLegalConsentFields/);
});

test("auth screens wire useLoginScreenStyles + AUTH_PAGE_LAYOUT hero", () => {
  const login = readMobile("app/(auth)/login.tsx");
  const register = readMobile("app/(auth)/register.tsx");
  const forgot = readMobile("app/(auth)/forgot-password.tsx");

  for (const src of [login, register, forgot]) {
    assert.match(src, /useLoginScreenStyles/);
    assert.match(src, /AUTH_PAGE_LAYOUT/);
    assert.doesNotMatch(src, /useAuthFormStyles/);
  }
});
