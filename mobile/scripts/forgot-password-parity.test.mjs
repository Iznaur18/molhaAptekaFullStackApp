import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("forgot-password screen matches web AuthPage layout", () => {
  const layout = readMobile("shared/lib/authPageLayout.ts");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const forgot = readMobile("app/(auth)/forgot-password.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const webCss = readClient("pages/auth/ui/AuthPage.css");
  const webForgot = readClient("pages/auth/ui/ForgotPasswordPage.jsx");

  assert.match(webCss, /--auth-page-column-max:\s*420px/);
  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
  assert.match(layout, /inputPaddingY: 12/);
  assert.match(layout, /inputFontSize: 15/);

  assert.match(styles, /maxWidth: A\.columnMaxWidth/);
  assert.match(styles, /channelBtnActive/);
  assert.match(styles, /textDecorationLine: "underline"/);

  assert.match(forgot, /styles\.column/);
  assert.match(forgot, /channelBtn/);
  assert.match(forgot, /ScreenBackButton/);
  assert.match(forgot, /AUTH_PAGE_LAYOUT/);
  assert.match(forgot, /LayoutAnimation/);
  assert.match(forgot, /FORGOT_CHANNEL_ARIA/);
  assert.doesNotMatch(forgot, /ModalSectionTabs/);
  assert.doesNotMatch(forgot, /useScreenLayout/);
  assert.doesNotMatch(forgot, /centeredContentStyle/);

  assert.match(copy, /FORGOT_CHANNEL_ARIA:\s*"Способ восстановления"/);
  assert.match(webForgot, /auth-page__column/);
  assert.match(webForgot, /Способ восстановления/);
  assert.match(webForgot, /auth-page__channel-btn/);
});
