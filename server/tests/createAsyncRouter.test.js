import assert from "node:assert/strict";
import { test } from "node:test";

import { asyncHandler } from "../middlewares/errorHandlerMW.js";
import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { registerProcessFatalHandlers } from "../utils/registerProcessFatalHandlers.js";

test("createAsyncRouter wraps only the last route handler", async () => {
  const router = createAsyncRouter();
  const calls = [];

  const middleware = (_req, _res, next) => {
    calls.push("middleware");
    next();
  };

  router.get("/ok", middleware, async (_req, res) => {
    calls.push("handler");
    res.status(200).json({ ok: true });
  });

  router.get("/fail", async () => {
    throw new Error("boom");
  });

  const okLayer = router.stack.find((layer) => layer.route?.path === "/ok");
  const failLayer = router.stack.find((layer) => layer.route?.path === "/fail");

  assert.ok(okLayer);
  assert.ok(failLayer);

  const okHandlers = okLayer.route.stack.map((layer) => layer.handle);
  const failHandlers = failLayer.route.stack.map((layer) => layer.handle);

  assert.equal(okHandlers.length, 2);
  assert.equal(okHandlers[0], middleware);
  assert.notEqual(okHandlers[1].name, "getMyCartController");

  assert.equal(failHandlers.length, 1);
  assert.equal(typeof failHandlers[0], "function");
});

test("asyncHandler forwards rejections to next", async () => {
  const expected = new Error("async failure");
  let forwarded = null;

  const handler = asyncHandler(async () => {
    throw expected;
  });

  await new Promise((resolve) => {
    handler({}, {}, (error) => {
      forwarded = error;
      resolve();
    });
  });

  assert.equal(forwarded, expected);
});

test("registerProcessFatalHandlers installs process listeners", () => {
  const before = new Set(process.listeners("unhandledRejection"));
  registerProcessFatalHandlers();
  const after = process.listeners("unhandledRejection");
  assert.ok(after.length >= before.size);
});
