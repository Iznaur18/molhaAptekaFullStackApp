import { z } from "zod";

/** Синхрон с `server/constants/productReportConstants.js`. */
export const PRODUCT_REPORT_TEXT_MAX_CHARS = 1000;
export const PRODUCT_REPORT_RESOLUTION_DISMISS = "dismiss";
export const PRODUCT_REPORT_RESOLUTION_HIDE = "hide";
export const PRODUCT_REPORT_RESOLUTION_REJECT = "reject";
export const PRODUCT_REPORT_RESOLUTIONS = [
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
];
export const PRODUCT_REPORT_STAFF_NOTE_MAX_CHARS = 2000;

export const submitProductReportBodySchema = z.object({
  reportText: z
    .string({ required_error: "reportText должен быть строкой" })
    .trim()
    .min(1, "Укажите текст жалобы")
    .max(
      PRODUCT_REPORT_TEXT_MAX_CHARS,
      `Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`,
    ),
});

export const resolveProductReportsBodySchema = z.object({
  resolution: z
    .string({ required_error: "resolution должен быть строкой" })
    .refine(
      (value) => PRODUCT_REPORT_RESOLUTIONS.includes(value),
      "Недопустимое действие",
    ),
  staffNote: z
    .string({ required_error: "staffNote должен быть строкой" })
    .trim()
    .min(1, "Комментарий обязателен")
    .max(
      PRODUCT_REPORT_STAFF_NOTE_MAX_CHARS,
      `Комментарий не длиннее ${PRODUCT_REPORT_STAFF_NOTE_MAX_CHARS} символов`,
    ),
});
