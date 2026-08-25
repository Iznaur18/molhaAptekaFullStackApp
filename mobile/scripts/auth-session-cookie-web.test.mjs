import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

test("Expo web DEV uses web-dev Bearer like Vite (not cookie-only)", () => {
  const storage = read("shared/api/authTokenStorage.ts");
  const api = read("shared/api/apiClient.ts");
  const session = read("entities/session/model/useAuthSessionQuery.ts");
  const login = read("entities/session/api/loginUser.ts");

  assert.match(storage, /isWebDevBearerAuth/);
  assert.match(storage, /dev_access_token/);
  assert.match(storage, /Platform\.OS === "web" && __DEV__/);
  assert.match(storage, /isCookieAuthWeb[\s\S]*!__DEV__/);

  assert.match(api, /X-Auth-Client.*=.*"web-dev"/);
  assert.match(api, /isWebDevBearerAuth\(\)/);

  assert.match(session, /if \(isCookieAuthWeb\(\)\)/);
  assert.match(session, /getAccessToken/);
  assert.match(session, /fetchAuthMe/);

  assert.match(login, /!isCookieAuthWeb\(\)/);
  assert.match(login, /setAuthTokens/);
});
