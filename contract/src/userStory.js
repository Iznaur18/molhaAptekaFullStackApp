import { z } from "zod";

/** Синхрон с `server/constants/userStoryConstants.js`. */
export const USER_STORY_MEDIA_TYPES = ["image", "video"];
export const USER_STORY_CAPTION_MAX_CHARS = 150;
/** Синхрон с `server/constants/userStoryConstants.js`. */
export const USER_STORY_VIDEO_MAX_DURATION_SEC = 30;
export const USER_STORY_REPORT_RESOLUTION_DISMISS = "dismiss";
export const USER_STORY_REPORT_RESOLUTION_HIDE = "hide";
export const USER_STORY_REPORT_RESOLUTION_VALUES = [
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
];

/** Синхрон с `server/constants/productReportConstants.js`. */
export const PRODUCT_REPORT_TEXT_MAX_CHARS = 1000;

export const USER_STORY_STAFF_NOTE_MAX_CHARS = 2000;

export const createUserStoryBodySchema = z.object({
  mediaType: z
    .string()
    .trim()
    .refine(
      (value) => USER_STORY_MEDIA_TYPES.includes(value),
      "Укажите тип медиа: image или video",
    ),
  mediaUrl: z.string().trim().min(1, "Укажите URL медиа"),
  captionText: z
    .string()
    .trim()
    .max(
      USER_STORY_CAPTION_MAX_CHARS,
      `Текст сторис: не больше ${USER_STORY_CAPTION_MAX_CHARS} символов`,
    )
    .optional(),
});

export const submitUserStoryReportBodySchema = z.object({
  reportText: z
    .string()
    .trim()
    .min(1, "Укажите текст жалобы")
    .max(
      PRODUCT_REPORT_TEXT_MAX_CHARS,
      `Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`,
    ),
});

export const resolveUserStoryReportsBodySchema = z.object({
  resolution: z
    .string()
    .trim()
    .refine(
      (value) => USER_STORY_REPORT_RESOLUTION_VALUES.includes(value),
      "Недопустимое действие",
    ),
  staffNote: z
    .string()
    .trim()
    .min(1, "Комментарий staff обязателен")
    .max(
      USER_STORY_STAFF_NOTE_MAX_CHARS,
      `Комментарий staff: не больше ${USER_STORY_STAFF_NOTE_MAX_CHARS} символов`,
    ),
});
