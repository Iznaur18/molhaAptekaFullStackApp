import assert from "node:assert/strict";
import test from "node:test";

import { buildWebPushClickPath } from "../services/user/webPushNotifications.js";

test("buildWebPushClickPath: productId wins", () => {
  assert.equal(
    buildWebPushClickPath({ kind: "anything", productId: "abc123" }),
    "/product/abc123",
  );
});

test("buildWebPushClickPath: follower → subscriptions", () => {
  assert.equal(
    buildWebPushClickPath({
      kind: "user_new_follower",
      actorUserId: "u1",
    }),
    "/subscriptions",
  );
});

test("buildWebPushClickPath: seller new order → my-sales", () => {
  assert.equal(
    buildWebPushClickPath({ kind: "seller_new_order" }),
    "/my-sales",
  );
});

test("buildWebPushClickPath: fallback notifications", () => {
  assert.equal(buildWebPushClickPath({ kind: "unknown_kind" }), "/notifications");
});
