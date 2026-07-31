import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("checkAuthMW: non-JWT errors are rethrown via next", () => {
  const source = readFileSync(
    path.join(root, "middlewares/checkAuthMW.js"),
    "utf8",
  );
  assert.match(source, /isJwtAuthFailure/);
  assert.match(source, /return next\(error\)/);
  assert.doesNotMatch(source, /catch \{\s*return errorRes\(res, 401/);
});

test("GENERAL_RATE_LIMIT prod default is not 50k", () => {
  const source = readFileSync(
    path.join(root, "constants/rateLimitConstants.js"),
    "utf8",
  );
  assert.match(source, /5_000/);
  assert.doesNotMatch(source, /50_000/);
});

test("userStoryReport does not skipSuccessfulRequests", () => {
  const source = readFileSync(
    path.join(root, "middlewares/rateLimitMW.js"),
    "utf8",
  );
  const block = source.slice(
    source.indexOf("handlers.userStoryReport"),
    source.indexOf("handlers.userStoryCreate"),
  );
  assert.doesNotMatch(block, /skipSuccessfulRequests:\s*true/);
});

test("createApp /health returns status only", () => {
  const source = readFileSync(path.join(root, "createApp.js"), "utf8");
  assert.match(source, /json\(\{ status: health\.status \}\)/);
  assert.doesNotMatch(
    source,
    /if \(isProduction\)[\s\S]*json\(\{ status: health\.status \}\)/,
  );
});
