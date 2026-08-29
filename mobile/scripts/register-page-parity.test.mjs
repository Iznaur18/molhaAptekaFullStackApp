import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("register screen matches web AuthPage layout", () => {
  const layout = readMobile("shared/lib/authPageLayout.ts");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const register = readMobile("app/(auth)/register.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const webCss = readClient("pages/auth/ui/AuthPage.css");
  const webRegister = readClient("pages/auth/ui/RegisterPage.jsx");

  assert.match(webCss, /--auth-page-column-max:\s*420px/);
  assert.match(layout, /columnMaxWidth: 420/);
  assert.match(layout, /heroRadius: 32/);
  assert.match(layout, /inputPaddingY: 12/);
  assert.match(layout, /inputFontSize: 15/);

  assert.match(styles, /maxWidth: A\.columnMaxWidth/);
  assert.match(styles, /channelBtnActive/);
  assert.match(styles, /textDecorationLine: "underline"/);

  assert.match(register, /styles\.column/);
  assert.match(register, /channelBtn/);
  assert.match(register, /ScreenBackButton/);
  assert.match(register, /AUTH_PAGE_LAYOUT/);
  assert.match(register, /LayoutAnimation/);
  assert.match(register, /REGISTER_CHANNEL_ARIA/);
  assert.match(register, /router\.replace\("\/\(tabs\)\/me"\)/);
  assert.doesNotMatch(register, /ModalSectionTabs/);
  assert.doesNotMatch(register, /useScreenLayout/);
  assert.doesNotMatch(register, /centeredContentStyle/);

  assert.match(copy, /REGISTER_CHANNEL_ARIA:\s*"Способ регистрации"/);
  assert.match(webRegister, /auth-page__column/);
  assert.match(webRegister, /Способ регистрации/);
  assert.match(webRegister, /auth-page__channel-btn/);
  assert.match(webRegister, /navigate\("\/me"/);
});
