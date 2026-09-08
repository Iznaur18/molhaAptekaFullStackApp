import assert from "node:assert/strict";
import { test } from "node:test";

import { isEmailAuthEnabled, resolveAuthContactChannel } from "../dist/index.js";

test("явный EMAIL_AUTH_ENABLED=false рубит почту даже в test", () => {
  assert.equal(isEmailAuthEnabled({ NODE_ENV: "test", EMAIL_AUTH_ENABLED: "false" }), false);
  assert.equal(resolveAuthContactChannel("email", { EMAIL_AUTH_ENABLED: "false" }), "phone");
});

test("явный EMAIL_AUTH_ENABLED=true включает почту", () => {
  assert.equal(
    isEmailAuthEnabled({ NODE_ENV: "production", EMAIL_AUTH_ENABLED: "true" }),
    true,
  );
  assert.equal(
    resolveAuthContactChannel("email", { EMAIL_AUTH_ENABLED: "true" }),
    "email",
  );
});

test("без env в production почта выключена, в test — включена", () => {
  assert.equal(isEmailAuthEnabled({ NODE_ENV: "production" }), false);
  assert.equal(isEmailAuthEnabled({ NODE_ENV: "test" }), true);
});
