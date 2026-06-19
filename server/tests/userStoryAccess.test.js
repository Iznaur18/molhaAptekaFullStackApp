import assert from "node:assert/strict";
import { test } from "node:test";

import { canPublishUserStory } from "../services/user/userStoryHelpers.js";

test("canPublishUserStory allows any non-blocked user", () => {
  assert.equal(
    canPublishUserStory({
      isPremiumUser: false,
      isActiveUser: false,
      userRole: "user",
      isBlockedUser: false,
    }),
    true,
  );

  assert.equal(
    canPublishUserStory({
      isPremiumUser: true,
      isActiveUser: true,
      userRole: "user",
      isBlockedUser: false,
    }),
    true,
  );

  assert.equal(canPublishUserStory(null), false);
  assert.equal(canPublishUserStory({ isBlockedUser: true }), false);
});
