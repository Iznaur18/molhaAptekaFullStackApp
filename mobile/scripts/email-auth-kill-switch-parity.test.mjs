import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("login/register/forgot hide email channel behind shared kill switch", () => {
  const login = readMobileFile("app/(auth)/login.tsx");
  const register = readMobileFile("app/(auth)/register.tsx");
  const forgot = readMobileFile("app/(auth)/forgot-password.tsx");
  const toggle = readMobileFile("shared/ui/AuthContactChannelToggle.tsx");

  assert.match(login, /resolveAuthContactChannel\("email"\)/);
  assert.match(login, /AuthContactChannelToggle/);
  assert.match(register, /AuthContactChannelToggle/);
  assert.match(forgot, /AuthContactChannelToggle/);
  assert.match(toggle, /isEmailAuthEnabled\(\)/);
  assert.match(toggle, /return null/);
});
