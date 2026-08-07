import { describe, expect, it, vi } from "vitest";

import { emptyBodyValidation } from "./emptyBodyValidation.js";

const [validate] = emptyBodyValidation;

const run = (body) => {
  const req = { body };
  const res = {};
  const next = vi.fn();
  const result = validate(req, res, next);
  return { req, res, next, result };
};

describe("emptyBodyValidation", () => {
  it("accepts undefined body as empty object", () => {
    const { req, next } = run(undefined);
    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({});
  });

  it("accepts null body as empty object", () => {
    const { req, next } = run(null);
    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({});
  });

  it("accepts empty object", () => {
    const { req, next } = run({});
    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({});
  });

  it("rejects extra fields", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    emptyBodyValidation[0]({ body: { foo: 1 } }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
