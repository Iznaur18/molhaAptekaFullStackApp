import { z } from "zod";

export const apiSuccessEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

/**
 * @template {import('zod').ZodTypeAny} TSchema
 * @param {unknown} payload
 * @param {TSchema} dataSchema
 * @returns {z.infer<TSchema>}
 */
export function parseApiSuccess(payload, dataSchema) {
  const envelope = apiSuccessEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    throw new Error("INVALID_API_ENVELOPE");
  }
  const parsed = dataSchema.safeParse(envelope.data.data);
  if (!parsed.success) {
    throw new Error("INVALID_API_DATA");
  }
  return parsed.data;
}

/**
 * @param {import('zod').ZodError} error
 * @param {string} [fallback]
 */
export function formatZodFieldError(error, fallback = "Некорректные данные") {
  const issue = error.issues[0];
  if (!issue) {
    return fallback;
  }
  const path = issue.path.length > 0 ? `${String(issue.path[0])}: ` : "";
  return `${path}${issue.message}`;
}

/** @param {import('zod').ZodError} error */
export function formatZodQueryError(error) {
  return formatZodFieldError(error, "Некорректные параметры запроса");
}

/** @param {import('zod').ZodError} error */
export function formatZodBodyError(error) {
  return formatZodFieldError(error, "Некорректное тело запроса");
}
