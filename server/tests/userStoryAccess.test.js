import assert from "node:assert/strict";
import { test } from "node:test";

import { canPublishUserStory } from "../services/user/userStoryHelpers.js";

test("canPublishUserStory requires an active premium subscription", () => {
  // Обычный пользователь без премиума — публиковать нельзя
  assert.equal(
    canPublishUserStory({
      isPremiumUser: false,
      isActiveUser: true,
      userRole: "user",
      isBlockedUser: false,
    }),
    false,
  );

  // Активный премиум без даты окончания — можно
  assert.equal(
    canPublishUserStory({
      isPremiumUser: true,
      isActiveUser: true,
      userRole: "user",
      isBlockedUser: false,
    }),
    true,
  );

  // Премиум с будущей датой окончания — можно
  assert.equal(
    canPublishUserStory({
      isPremiumUser: true,
      premiumExpiresAt: new Date(Date.now() + 60_000),
      userRole: "user",
      isBlockedUser: false,
    }),
    true,
  );

  // Просроченный премиум — нельзя
  assert.equal(
    canPublishUserStory({
      isPremiumUser: true,
      premiumExpiresAt: new Date(Date.now() - 60_000),
      userRole: "user",
      isBlockedUser: false,
    }),
    false,
  );
});

test("canPublishUserStory allows staff without premium", () => {
  assert.equal(
    canPublishUserStory({
      isPremiumUser: false,
      userRole: "admin",
      isBlockedUser: false,
    }),
    true,
  );
});

test("canPublishUserStory denies blocked and missing users", () => {
  assert.equal(canPublishUserStory(null), false);
  assert.equal(
    canPublishUserStory({ isPremiumUser: true, isBlockedUser: true }),
    false,
  );
});
