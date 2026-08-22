import assert from "node:assert/strict";
import test from "node:test";

import {
  assertUserNameFormat,
  USER_NAME_FORMAT_ERROR,
} from "../validations/user/userNameRules.js";

test("server userNameRules accepts Instagram-like nicknames", () => {
  for (const name of ["abc", "user.name", "user_name", "_ok", "ok_"]) {
    assert.doesNotThrow(() => assertUserNameFormat(name), name);
  }
});

test("server userNameRules rejects edge cases", () => {
  for (const name of [".user", "user.", "a..b", "___", "ab"]) {
    assert.throws(() => assertUserNameFormat(name), Error, name);
  }
  assert.throws(() => assertUserNameFormat(".x."), (err) => {
    assert.equal(err.message, USER_NAME_FORMAT_ERROR);
    return true;
  });
});
