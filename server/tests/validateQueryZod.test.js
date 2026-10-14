import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { z } from "zod";

import { validateQueryZod } from "../middlewares/validateQueryZod.js";

const schema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  role: z.enum(["buyer", "seller"]).optional().default("buyer"),
});

/** `req.query` как в Express 5: геттер, каждый раз — заново разобранный адрес. */
const expressFiveRequest = (raw) => {
  const req = {};
  Object.defineProperty(req, "query", {
    get: () => ({ ...raw }),
    enumerable: true,
    configurable: true,
  });
  return req;
};

const run = (req) => {
  let nextCalled = false;
  let status = null;
  const res = {
    locals: {},
    status(code) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };
  validateQueryZod(schema)(req, res, () => {
    nextCalled = true;
  });
  return { nextCalled, status };
};

describe("validateQueryZod", () => {
  it("приведённые значения и значения по умолчанию лежат в validatedQuery", () => {
    const req = expressFiveRequest({ page: "2" });
    const { nextCalled } = run(req);

    assert.equal(nextCalled, true);
    assert.deepEqual(req.validatedQuery, { page: 2, role: "buyer" });
    // А в req.query они не попадают — так ведёт себя Express 5.
    assert.equal(req.query.page, "2");
    assert.equal(req.query.role, undefined);
  });

  it("неверный параметр — 400, дальше запрос не идёт", () => {
    const req = expressFiveRequest({ role: "admin" });
    const { nextCalled, status } = run(req);

    assert.equal(nextCalled, false);
    assert.equal(status, 400);
    assert.equal(req.validatedQuery, undefined);
  });
});
