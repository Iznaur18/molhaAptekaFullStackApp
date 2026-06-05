import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildSpaContentSecurityPolicy } from "../utils/buildSpaContentSecurityPolicy.js";

describe("buildSpaContentSecurityPolicy", () => {
  test("variant A: same origin media — CDN host not duplicated", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://izibuy.ru",
      mediaOrigin: "https://izibuy.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /img-src 'self' data: blob: https:/);
    assert.doesNotMatch(csp, /img-src[^;]*https:\/\/izibuy\.ru/);
    assert.match(csp, /connect-src 'self'/);
    assert.doesNotMatch(csp, /connect-src[^;]*https:\/\/izibuy\.ru/);
  });

  test("S3 CDN: media origin added to img-src and media-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://izibuy.ru",
      mediaOrigin: "https://cdn.izibuy.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /img-src[^;]*https:\/\/cdn\.izibuy\.ru/);
    assert.match(csp, /media-src[^;]*https:\/\/cdn\.izibuy\.ru/);
  });

  test("split API: VITE_API_URL in connect-src", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://app.izibuy.ru",
      mediaOrigin: "https://cdn.izibuy.ru",
      apiOrigin: "https://api.izibuy.ru",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /connect-src[^;]*https:\/\/api\.izibuy\.ru/);
  });

  test("Sentry DSN adds ingest origin and wildcard", () => {
    const csp = buildSpaContentSecurityPolicy({
      frontendOrigin: "https://izibuy.ru",
      sentryDsn: "https://abc@o123.ingest.sentry.io/456",
      upgradeInsecureRequests: true,
    });

    assert.match(csp, /connect-src[^;]*https:\/\/o123\.ingest\.sentry\.io/);
    assert.match(csp, /connect-src[^;]*https:\/\/\*\.ingest\.sentry\.io/);
  });
});
