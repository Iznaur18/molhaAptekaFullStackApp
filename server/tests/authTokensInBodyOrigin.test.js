import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { shouldIncludeAuthTokensInBody } from "../constants/authClientConstants.js";

const originalNodeEnv = process.env.NODE_ENV;
const originalFrontendUrl = process.env.FRONTEND_URL;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalFrontendUrl === undefined) {
    delete process.env.FRONTEND_URL;
  } else {
    process.env.FRONTEND_URL = originalFrontendUrl;
  }
});

/**
 * @param {{ client?: string; origin?: string; referer?: string }} headers
 */
const requestWith = ({ client = "", origin = "", referer = "" }) => ({
  get: (name) => {
    const key = String(name).toLowerCase();
    if (key === "x-auth-client") return client;
    if (key === "origin") return origin;
    if (key === "referer") return referer;
    return "";
  },
});

test("prod: XSS на origin SPA не может вытащить токены под видом mobile", () => {
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_URL = "https://gitorg.ru,https://www.gitorg.ru";

  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "mobile", origin: "https://gitorg.ru" }),
    ),
    false,
  );
  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "mobile", origin: "https://www.gitorg.ru" }),
    ),
    false,
  );
  // Origin отсутствует, но Referer выдаёт браузер на SPA-origin.
  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "mobile", referer: "https://gitorg.ru/cart" }),
    ),
    false,
  );
});

test("prod: настоящий мобильный клиент (без Origin) токены получает", () => {
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_URL = "https://gitorg.ru";

  assert.equal(shouldIncludeAuthTokensInBody(requestWith({ client: "mobile" })), true);
});

test("prod: web-dev не действует", () => {
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_URL = "https://gitorg.ru";

  assert.equal(
    shouldIncludeAuthTokensInBody(requestWith({ client: "web-dev" })),
    false,
  );
  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "web-dev", origin: "https://evil.example" }),
    ),
    false,
  );
});

test("dev/LAN: web-dev и mobile работают как раньше", () => {
  process.env.NODE_ENV = "development";
  process.env.FRONTEND_URL = "http://127.0.0.1:5173";

  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "web-dev", origin: "http://192.168.1.20:5173" }),
    ),
    true,
  );
  assert.equal(
    shouldIncludeAuthTokensInBody(
      requestWith({ client: "web-dev", origin: "http://127.0.0.1:5173" }),
    ),
    true,
  );
  assert.equal(shouldIncludeAuthTokensInBody(requestWith({ client: "mobile" })), true);
});

test("без заголовка токены не отдаются никогда", () => {
  for (const nodeEnv of ["production", "development"]) {
    process.env.NODE_ENV = nodeEnv;
    assert.equal(shouldIncludeAuthTokensInBody(requestWith({})), false);
    assert.equal(shouldIncludeAuthTokensInBody(requestWith({ client: "web" })), false);
    assert.equal(shouldIncludeAuthTokensInBody(null), false);
  }
});
