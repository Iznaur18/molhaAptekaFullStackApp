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
    const issue = parsed.error.issues[0];
    const detail = issue
      ? `${issue.path.length > 0 ? issue.path.join(".") : "(root)"}: ${issue.message}`
      : "";
    const error = new Error("INVALID_API_DATA");
    if (detail) {
      error.cause = detail;
    }
    throw error;
  }
  return parsed.data;
}

/**
 * @param {import('zod').ZodError} error
 * @param {string} [fallback]
 */
export function formatZodFieldError(error, fallback = "Некорректные данные") {
  const issue = error.issues[0];
  if (!issue?.message?.trim()) {
    return fallback;
  }
  // Только RU message из схемы — без path вроде `labelRu:` (это не для юзера).
  return String(issue.message).trim();
}

/** @param {import('zod').ZodError} error */
export function formatZodQueryError(error) {
  return formatZodFieldError(error, "Некорректные параметры запроса");
}

/** @param {import('zod').ZodError} error */
export function formatZodBodyError(error) {
  return formatZodFieldError(error, "Некорректное тело запроса");
}

/** @param {import('zod').ZodError} error */
export function formatZodParamError(error) {
  return formatZodFieldError(error, "Некорректные параметры URL");
}
