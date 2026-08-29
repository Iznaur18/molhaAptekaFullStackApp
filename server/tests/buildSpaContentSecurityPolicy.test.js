import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildSpaContentSecurityPolicy } from "../utils/buildSpaContentSecurityPolicy.js";

describe("buildSpaContentSecurityPolicy", () => {
  test("variant A: same origin media — CDN host not duplicated", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://gitorg.ru",
      mediaOrigin: "https://gitorg.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /img-src 'self' data: blob: https:/);
    assert.doesNotMatch(csp, /img-src[^;]*https:\/\/gitorg\.ru/);
    assert.match(csp, /connect-src 'self'/);
    assert.doesNotMatch(csp, /connect-src[^;]*https:\/\/gitorg\.ru/);
  });

  test("S3 CDN: media origin added to img-src and media-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://gitorg.ru",
      mediaOrigin: "https://cdn.gitorg.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /img-src[^;]*https:\/\/cdn\.gitorg\.ru/);
    assert.match(csp, /media-src[^;]*https:\/\/cdn\.gitorg\.ru/);
  });

  test("split API: VITE_API_URL in connect-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://app.gitorg.ru",
      mediaOrigin: "https://cdn.gitorg.ru",
      apiOrigin: "https://api.gitorg.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /connect-src[^;]*https:\/\/api\.gitorg\.ru/);
  });

  test("Sentry DSN adds ingest origin and wildcard", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://gitorg.ru",
      sentryDsn: "https://abc@o123.ingest.sentry.io/456",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /connect-src[^;]*https:\/\/o123\.ingest\.sentry\.io/);
    assert.match(csp, /connect-src[^;]*https:\/\/\*\.ingest\.sentry\.io/);
  });

  test("Plausible script adds script-src and connect-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://gitorg.ru",
      plausibleScriptSrc: "https://plausible.io/js/pa-bpk-uLbAhfVhsvkpa1DW3.js",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /script-src[^;]*https:\/\/plausible\.io/);
    assert.match(csp, /connect-src[^;]*https:\/\/plausible\.io/);
  });

  test("inline script hashes land in script-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://gitorg.ru",
      inlineScriptHashes: ["'sha256-XTXJQvmpZzPx4C1a9cJbXI7HH/DvsaJqqxo+7aILbqc='", ""],
      upgradeInsecureRequests: true,
    });

    assert.match(
      csp,
      /script-src 'self' 'sha256-XTXJQvmpZzPx4C1a9cJbXI7HH\/DvsaJqqxo\+7aILbqc='/,
    );
  });
});
