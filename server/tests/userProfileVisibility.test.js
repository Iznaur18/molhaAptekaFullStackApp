import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizeUserProfileForViewer,
  sanitizeUsersSearchList,
} from "../services/user/userProfileVisibility.js";

const TARGET = {
  _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  userName: "seller",
  email: "seller@example.com",
  userPhoneNumber: "+79123456789",
  userLoyaltyPoints: 42,
  userAddress: "secret",
  userRole: "user",
  isActiveUser: true,
  isBlockedUser: false,
  userDiscountPercent: 5,
  notesAboutUser: "bio",
};

test("sanitizeUserProfileForViewer: guest strips phone, keeps loyalty + hasPhoneNumber", () => {
  const out = sanitizeUserProfileForViewer(TARGET, { viewer: null, viewerId: null });
  assert.equal(out.userPhoneNumber, undefined);
  assert.equal(out.hasPhoneNumber, true);
  assert.equal(out.userLoyaltyPoints, 42);
  assert.equal(out.email, undefined);
  assert.equal(out.userName, "seller");
});

test("sanitizeUserProfileForViewer: logged-in other strips phone, keeps loyalty + hasPhoneNumber", () => {
  const out = sanitizeUserProfileForViewer(TARGET, {
    viewer: { _id: "bbbbbbbbbbbbbbbbbbbbbbbb", userRole: "user" },
    viewerId: "bbbbbbbbbbbbbbbbbbbbbbbb",
  });
  assert.equal(out.userPhoneNumber, undefined);
  assert.equal(out.hasPhoneNumber, true);
  assert.equal(out.userLoyaltyPoints, 42);
  assert.equal(out.email, undefined);
  assert.equal(out.userAddress, undefined);
  assert.equal(out.userRole, undefined);
});

test("sanitizeUserProfileForViewer: self keeps phone and private fields", () => {
  const out = sanitizeUserProfileForViewer(TARGET, {
    viewer: { _id: TARGET._id, userRole: "user" },
    viewerId: TARGET._id,
  });
  assert.equal(out.userPhoneNumber, "+79123456789");
  assert.equal(out.hasPhoneNumber, undefined);
  assert.equal(out.userLoyaltyPoints, 42);
  assert.equal(out.email, "seller@example.com");
});

test("sanitizeUserProfileForViewer: guest keeps public social links", () => {
  const out = sanitizeUserProfileForViewer(
    {
      ...TARGET,
      socialTelegramUrl: "https://t.me/seller",
      socialWebsiteUrl: "https://example.com",
    },
    { viewer: null, viewerId: null },
  );
  assert.equal(out.socialTelegramUrl, "https://t.me/seller");
  assert.equal(out.socialWebsiteUrl, "https://example.com");
  assert.equal(out.notesAboutUser, undefined);
});

test("sanitizeUserProfileForViewer: no phone → no hasPhoneNumber", () => {
  const out = sanitizeUserProfileForViewer(
    { ...TARGET, userPhoneNumber: "" },
    { viewer: null, viewerId: null },
  );
  assert.equal(out.userPhoneNumber, undefined);
  assert.equal(out.hasPhoneNumber, undefined);
});

test("sanitizeUsersSearchList: non-admin never gets phone", () => {
  const [row] = sanitizeUsersSearchList([TARGET], {
    viewer: { _id: "bbbbbbbbbbbbbbbbbbbbbbbb", userRole: "user" },
  });
  assert.equal(row.userPhoneNumber, undefined);
  assert.equal(row.email, undefined);
  assert.equal(row.userLoyaltyPoints, 42);
});
