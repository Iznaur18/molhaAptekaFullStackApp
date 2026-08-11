import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("checkAuthMW: non-JWT errors are rethrown via next", () => {
  const source = readFileSync(path.join(root, "middlewares/checkAuthMW.js"), "utf8");
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
  const source = readFileSync(path.join(root, "middlewares/rateLimitMW.js"), "utf8");
  const block = source.slice(
    source.indexOf("handlers.userStoryReport"),
    source.indexOf("handlers.userStoryCreate"),
  );
  assert.doesNotMatch(block, /skipSuccessfulRequests:\s*true/);
});

test("authRateLimiter keys by email when present", () => {
  const source = readFileSync(path.join(root, "middlewares/rateLimitMW.js"), "utf8");
  assert.match(source, /rateLimitKeyByAuthIdentityOrIp/);
  assert.match(source, /auth:\$\{ip\}:\$\{email\}/);
});

test("gap mutators have dedicated rate limiters wired", () => {
  const mw = readFileSync(path.join(root, "middlewares/rateLimitMW.js"), "utf8");
  assert.match(mw, /handlers\.advertisingSubmit/);
  assert.match(mw, /handlers\.moneyMutation/);
  assert.match(mw, /handlers\.productCreate/);
  assert.match(mw, /handlers\.installmentAction/);
  assert.match(mw, /handlers\.catalogList/);

  const intro = readFileSync(path.join(root, "routes/introAdRouter.js"), "utf8");
  assert.match(intro, /advertisingSubmitRateLimiter/);

  const header = readFileSync(
    path.join(root, "routes/siteHeaderBannerCampaignRouter.js"),
    "utf8",
  );
  assert.match(header, /advertisingSubmitRateLimiter/);

  const personal = readFileSync(
    path.join(root, "routes/sellerPersonalCategoryRouter.js"),
    "utf8",
  );
  assert.match(personal, /advertisingSubmitRateLimiter/);

  const product = readFileSync(path.join(root, "routes/productRouter.js"), "utf8");
  assert.match(product, /productCreateRateLimiter/);
  assert.match(product, /catalogListRateLimiter/);
  assert.match(product, /moneyMutationRateLimiter/);
  assert.match(product, /installmentActionRateLimiter/);

  const user = readFileSync(path.join(root, "routes/userRouter.js"), "utf8");
  assert.match(user, /moneyMutationRateLimiter/);

  const installment = readFileSync(path.join(root, "routes/installmentRouter.js"), "utf8");
  assert.match(installment, /installmentActionRateLimiter/);
});

test("createApp /health returns status only", () => {
  const source = readFileSync(path.join(root, "createApp.js"), "utf8");
  assert.match(source, /json\(\{ status: health\.status \}\)/);
  assert.doesNotMatch(
    source,
    /if \(isProduction\)[\s\S]*json\(\{ status: health\.status \}\)/,
  );
});
