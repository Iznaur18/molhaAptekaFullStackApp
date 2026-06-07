import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Синхрон с `server/utils/validatePassportPayload.js`. */
export const PASSPORT_NAME_MAX_LENGTH = 80;
const PASSPORT_SERIES_RE = /^\d{4}$/;
const PASSPORT_NUMBER_RE = /^\d{6}$/;
const PASSPORT_DEPARTMENT_CODE_RE = /^\d{3}-\d{3}$/;
const PASSPORT_ISSUED_BY_MAX_WORDS = 20;

/**
 * @param {unknown} value
 */
function countWords(value) {
  if (value == null) return 0;
  const trimmed = String(value).trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function parsePassportDate(value, label) {
  if (value == null || value === "") {
    throw new Error(`Укажите ${label.toLowerCase()}`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Некорректная ${label.toLowerCase()}`);
  }
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

const passportFieldsSchema = z.object({
  lastName: z.string().trim().min(1, "Укажите фамилию").max(PASSPORT_NAME_MAX_LENGTH),
  firstName: z.string().trim().min(1, "Укажите имя").max(PASSPORT_NAME_MAX_LENGTH),
  middleName: z
    .string()
    .trim()
    .max(PASSPORT_NAME_MAX_LENGTH, "Некорректное отчество")
    .optional()
    .default(""),
  series: z
    .string()
    .trim()
    .regex(PASSPORT_SERIES_RE, "Серия паспорта: 4 цифры"),
  number: z
    .string()
    .trim()
    .regex(PASSPORT_NUMBER_RE, "Номер паспорта: 6 цифр"),
  issuedBy: z.string().trim().min(1, "Укажите, кем выдан паспорт"),
  departmentCode: z
    .string()
    .trim()
    .regex(PASSPORT_DEPARTMENT_CODE_RE, "Код подразделения: формат 000-000"),
  birthDate: z.coerce.date({ invalid_type_error: "Укажите дату рождения" }),
  issuedAt: z.coerce.date({ invalid_type_error: "Укажите дату выдачи" }),
  passportSelfiePhotoUrl: z.string().trim().min(1, "Загрузите фото с паспортом в руках"),
});

export const passportPayloadSchema = passportFieldsSchema.omit({
  passportSelfiePhotoUrl: true,
});

const passportDateRules = (data, ctx) => {
  if (countWords(data.issuedBy) > PASSPORT_ISSUED_BY_MAX_WORDS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Кем выдан: не больше ${PASSPORT_ISSUED_BY_MAX_WORDS} слов`,
      path: ["issuedBy"],
    });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let birthDate;
  let issuedAt;
  try {
    birthDate = parsePassportDate(data.birthDate, "Дата рождения");
    issuedAt = parsePassportDate(data.issuedAt, "Дата выдачи");
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : "Некорректные даты паспорта",
    });
    return;
  }

  if (issuedAt > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Дата выдачи не может быть в будущем",
      path: ["issuedAt"],
    });
  }
  if (birthDate > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Некорректная дата рождения",
      path: ["birthDate"],
    });
  }
  if (issuedAt < birthDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Дата выдачи не может быть раньше даты рождения",
      path: ["issuedAt"],
    });
  }
};

/**
 * Тело `POST /user/data-confirmation` (структура; selfie path — в контроллере).
 * Поддерживает вложенный `passport` и плоские поля.
 */
/** Синхрон с `server/constants/userDataConfirmationConstants.js`. */
export const USER_DATA_CONFIRMATION_RESOLUTION_APPROVE = "approve";
export const USER_DATA_CONFIRMATION_RESOLUTION_REJECT = "reject";
export const USER_DATA_CONFIRMATION_RESOLUTIONS = [
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
];
export const USER_DATA_CONFIRMATION_STAFF_NOTE_MAX_CHARS = 2000;

export const dataConfirmationRequestIdParamsSchema = z.object({
  requestId: mongoIdSchema,
});

export const resolveDataConfirmationBodySchema = z.object({
  resolution: z
    .string()
    .trim()
    .refine(
      (value) => USER_DATA_CONFIRMATION_RESOLUTIONS.includes(value),
      "resolution должен быть approve или reject",
    ),
  staffNote: z
    .string()
    .trim()
    .max(USER_DATA_CONFIRMATION_STAFF_NOTE_MAX_CHARS)
    .optional(),
});

export const submitDataConfirmationBodySchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }
  const body = /** @type {Record<string, unknown>} */ (raw);
  if (body.passport && typeof body.passport === "object" && !Array.isArray(body.passport)) {
    return {
      ...body.passport,
      passportSelfiePhotoUrl: body.passportSelfiePhotoUrl,
    };
  }
  return body;
}, passportFieldsSchema.superRefine(passportDateRules));
