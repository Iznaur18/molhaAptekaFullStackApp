import { formatZodQueryError } from "@molha/api-contract";

import { errorRes } from "../utils/index.js";

/**
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateQueryZod(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return errorRes(res, 400, formatZodQueryError(result.error));
    }
    Object.assign(req.query, result.data);
    return next();
  };
}
