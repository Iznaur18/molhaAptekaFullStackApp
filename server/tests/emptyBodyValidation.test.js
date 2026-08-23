import assert from "node:assert/strict";
import test from "node:test";

import { emptyBodyValidation } from "../validations/common/emptyBodyValidation.js";

const [validate] = emptyBodyValidation;

/**
 * Раньше этот тест лежал в `validations/common/*.test.js` и был написан на
 * vitest, которого в server нет: раннер (`node --test tests/**\/*.test.js`)
 * его не подхватывал, а импорт `vitest` упал бы. Он не выполнялся ни разу.
 */
const run = (body) => {
  const calls = { next: 0, status: [], json: [] };
  const req = { body };
  const res = {
    status(code) {
      calls.status.push(code);
      return res;
    },
    json(payload) {
      calls.json.push(payload);
      return res;
    },
  };
  validate(req, res, () => {
    calls.next += 1;
  });
  return { req, calls };
};

test("пустое тело: undefined трактуется как {}", () => {
  const { req, calls } = run(undefined);
  assert.equal(calls.next, 1);
  assert.deepEqual(req.body, {});
});

test("пустое тело: null трактуется как {}", () => {
  const { req, calls } = run(null);
  assert.equal(calls.next, 1);
  assert.deepEqual(req.body, {});
});

test("пустое тело: {} проходит", () => {
  const { req, calls } = run({});
  assert.equal(calls.next, 1);
  assert.deepEqual(req.body, {});
});

test("лишние поля в теле отклоняются с 400", () => {
  const { calls } = run({ foo: 1 });
  assert.equal(calls.next, 0);
  assert.deepEqual(calls.status, [400]);
});
