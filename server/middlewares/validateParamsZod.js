import { formatZodParamError } from "@molha/api-contract";

import { errorRes } from "../services/http/index.js";

/**
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateParamsZod(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return errorRes(res, 400, formatZodParamError(result.error));
    }
    Object.assign(req.params, result.data);
    return next();
  };
}
