import assert from "node:assert/strict";
import test from "node:test";

import {
  assertUserNameFormat,
  sanitizeUserNameInputLive,
  USER_NAME_FORMAT_ERROR,
  userNameFieldSchema,
} from "../src/userFields.js";

const VALID = [
  "abc",
  "user_name",
  "user.name",
  "u.n_1",
  "_user",
  "user_",
  "a_b.c",
  "a.b",
];

const INVALID = [
  ".user",
  "user.",
  "user..name",
  "...",
  "___",
  "._.",
  "ab",
  "user name",
  "User!",
  "юзер",
];

test("assertUserNameFormat accepts Instagram-like nicknames", () => {
  for (const name of VALID) {
    assert.doesNotThrow(() => assertUserNameFormat(name), name);
  }
});

test("assertUserNameFormat rejects invalid nicknames", () => {
  for (const name of INVALID) {
    assert.throws(() => assertUserNameFormat(name), Error, name);
  }
});

test("assertUserNameFormat rejects trailing/leading dot with shared message", () => {
  assert.throws(() => assertUserNameFormat(".abc"), (err) => {
    assert.equal(err.message, USER_NAME_FORMAT_ERROR);
    return true;
  });
  assert.throws(() => assertUserNameFormat("abc."), (err) => {
    assert.equal(err.message, USER_NAME_FORMAT_ERROR);
    return true;
  });
});

test("userNameFieldSchema normalizes and accepts dots/underscores", () => {
  assert.equal(userNameFieldSchema.parse("User.Name_1"), "user.name_1");
});

test("userNameFieldSchema rejects consecutive dots", () => {
  assert.throws(() => userNameFieldSchema.parse("user..name"));
});

test("sanitizeUserNameInputLive keeps dots and underscores", () => {
  assert.equal(sanitizeUserNameInputLive("User.Name_1!"), "user.name_1");
});
