import assert from "node:assert/strict";
import { test } from "node:test";

/** @param {string} src */
function isPlausiblePaScript(src) {
  return /\/pa-[^/]+\.js(?:\?|$)/i.test(src);
}

test("plausible pa-script detector", () => {
  assert.equal(
    isPlausiblePaScript(
      "https://plausible.io/js/pa-bpk-uLbAhfVhsvkpa1DW3.js",
    ),
    true,
  );
  assert.equal(isPlausiblePaScript("https://plausible.io/js/script.js"), false);
});
