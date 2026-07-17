import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readMobile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const readClient = (relativePath) =>
  readFileSync(join(CLIENT_ROOT, relativePath), "utf8");

test("mobile auth password fields expose show/hide toggle", () => {
  const input = readMobile("shared/ui/PasswordTextInput.tsx");
  const styles = readMobile("shared/theme/formChromeStyles.ts");
  const login = readMobile("app/(auth)/login.tsx");
  const register = readMobile("app/(auth)/register.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");

  assert.match(input, /secureTextEntry=\{!isVisible\}/);
  assert.match(input, /visibility-off/);
  assert.match(input, /SHOW_PASSWORD_ARIA/);
  assert.match(input, /showSoftInputOnFocus/);
  assert.match(input, /passwordWrapFocused/);
  assert.doesNotMatch(input, /scrollTextInputIntoViewOnFocus/);
  assert.match(styles, /passwordToggle:[\s\S]*position:\s*"absolute"/);
  assert.match(styles, /passwordInput:[\s\S]*width:\s*"100%"/);
  assert.match(styles, /passwordWrapFocused:/);
  assert.match(login, /PasswordTextInput/);
  assert.match(register, /PasswordTextInput/);
  assert.match(copy, /SHOW_PASSWORD_ARIA: "Показать пароль"/);
  assert.match(copy, /HIDE_PASSWORD_ARIA: "Скрыть пароль"/);
});

test("web auth password fields expose show/hide toggle", () => {
  const field = readClient("src/shared/ui/PasswordInputField/PasswordInputField.jsx");
  const login = readClient("src/entities/user/ui/LoginModal.jsx");
  const register = readClient("src/entities/user/ui/RegisterModal.jsx");

  assert.match(field, /EyeOff/);
  assert.match(field, /type=\{isVisible \? "text" : "password"\}/);
  assert.match(login, /PasswordInputField/);
  assert.match(register, /PasswordInputField/);
});
