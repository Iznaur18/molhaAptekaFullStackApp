import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("auth screens keep hero height stable across keyboard viewport shrink", () => {
  const hook = readMobile("shared/lib/useStableAuthHeroHeight.ts");
  const login = readMobile("app/(auth)/login.tsx");
  const register = readMobile("app/(auth)/register.tsx");
  const scroll = readMobile("shared/ui/AuthScreenScroll.tsx");
  const password = readMobile("shared/ui/PasswordTextInput.tsx");

  assert.match(hook, /useState\(\(\) =>/);
  assert.doesNotMatch(hook, /useWindowDimensions/);
  assert.match(login, /useStableAuthHeroHeight/);
  assert.match(login, /AuthScreenScroll/);
  assert.match(register, /useStableAuthHeroHeight/);
  assert.match(register, /AuthScreenScroll/);
  assert.match(scroll, /Platform\.OS === "web"/);
  assert.match(scroll, /overflowY:\s*"auto"/);
  assert.match(scroll, /keyboardShouldPersistTaps="always"/);
  assert.doesNotMatch(login, /scrollTextInputIntoViewOnFocus/);
  assert.doesNotMatch(register, /scrollTextInputIntoViewOnFocus/);
  assert.doesNotMatch(password, /scrollTextInputIntoViewOnFocus/);
  assert.doesNotMatch(login, /useWindowDimensions/);
  assert.doesNotMatch(register, /useWindowDimensions/);
});
