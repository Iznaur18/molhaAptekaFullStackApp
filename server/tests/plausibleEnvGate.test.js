import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * Pure helpers mirrored from client/mobile plausibleEnv (без Vite/Expo).
 * @param {string | undefined} raw
 */
function isDomainEnabled(raw) {
  return String(raw ?? "").trim().length > 0;
}

test("plausible: empty domain disables", () => {
  assert.equal(isDomainEnabled(""), false);
  assert.equal(isDomainEnabled("   "), false);
  assert.equal(isDomainEnabled(undefined), false);
});

test("plausible: non-empty domain enables", () => {
  assert.equal(isDomainEnabled("gitorg.ru"), true);
});
