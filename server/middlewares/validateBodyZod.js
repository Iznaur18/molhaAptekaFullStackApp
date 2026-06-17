import { formatZodBodyError } from "@molha/api-contract";

import { errorRes } from "../services/http/index.js";

/**
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateBodyZod(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return errorRes(res, 400, formatZodBodyError(result.error));
    }
    req.body = result.data;
    return next();
  };
}
