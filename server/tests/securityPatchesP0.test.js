import assert from "node:assert/strict";
import test from "node:test";

import { serializeUserForAuthResponse, buildAuthSessionData } from "../services/auth/issueAuthSession.js";
import {
  isSafeUploadFilename,
  parseUploadFilenameFromMediaUrl,
} from "../services/upload/parseUploadFilenameFromMediaUrl.js";
import { canStaffManageTargetUser } from "../services/access/premiumStaffAccess.js";
import { parsePrivateUploadFilenameFromUrl } from "../services/upload/privateUploadPaths.js";

test("serializeUserForAuthResponse strips passwordHash and authTokenVersion", () => {
  const out = serializeUserForAuthResponse({
    _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
    userName: "alice",
    email: "a@example.com",
    passwordHash: "$2b$10$secret",
    authTokenVersion: 3,
    emailVerificationTokenHash: "abc",
    userLoyaltyPoints: 10,
  });

  assert.equal(out.passwordHash, undefined);
  assert.equal(out.authTokenVersion, undefined);
  assert.equal(out.emailVerificationTokenHash, undefined);
  assert.equal(out.userName, "alice");
  assert.equal(out.email, "a@example.com");
  assert.equal(out.userLoyaltyPoints, 10);
});

test("web auth session omits tokens without X-Auth-Client", () => {
  const data = buildAuthSessionData(
    { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", userName: "a", email: "a@b.c" },
    "access.token.value",
    "refresh.token.value",
    { get: () => "" },
  );
  assert.equal(data.accessToken, undefined);
  assert.equal(data.refreshToken, undefined);
});

test("mobile auth session includes tokens with X-Auth-Client", () => {
  const data = buildAuthSessionData(
    { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", userName: "a", email: "a@b.c" },
    "access.token.value",
    "refresh.token.value",
    { get: (name) => (String(name).toLowerCase() === "x-auth-client" ? "mobile" : "") },
  );
  assert.equal(data.accessToken, "access.token.value");
  assert.equal(data.refreshToken, "refresh.token.value");
});

test("web-dev auth session includes tokens with X-Auth-Client web-dev", () => {
  const data = buildAuthSessionData(
    { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", userName: "a", email: "a@b.c" },
    "access.token.value",
    "refresh.token.value",
    { get: (name) => (String(name).toLowerCase() === "x-auth-client" ? "web-dev" : "") },
  );
  assert.equal(data.accessToken, "access.token.value");
  assert.equal(data.refreshToken, "refresh.token.value");
});

test("parseUploadFilenameFromMediaUrl rejects path traversal", () => {
  assert.equal(
    parseUploadFilenameFromMediaUrl("/uploads/..\\..\\windows\\system32\\x"),
    null,
  );
  assert.equal(parseUploadFilenameFromMediaUrl("/uploads/../secret.txt"), null);
  assert.equal(isSafeUploadFilename("1710000000-abc1234.webp"), true);
  assert.equal(
    parseUploadFilenameFromMediaUrl("/uploads/1710000000-abc1234.webp"),
    "1710000000-abc1234.webp",
  );
});

test("parsePrivateUploadFilenameFromUrl accepts private API path", () => {
  assert.equal(
    parsePrivateUploadFilenameFromUrl("/upload/private/1710000000-abc1234.webp"),
    "1710000000-abc1234.webp",
  );
  assert.equal(parsePrivateUploadFilenameFromUrl("/uploads/public.webp"), null);
});

test("canStaffManageTargetUser: moderator cannot manage admin", () => {
  assert.equal(
    canStaffManageTargetUser({ editorRole: "moderator", targetRole: "admin" }),
    false,
  );
  assert.equal(
    canStaffManageTargetUser({ editorRole: "moderator", targetRole: "user" }),
    true,
  );
  assert.equal(
    canStaffManageTargetUser({ editorRole: "admin", targetRole: "admin" }),
    true,
  );
});
