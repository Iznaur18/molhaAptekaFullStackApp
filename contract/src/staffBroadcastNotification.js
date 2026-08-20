import { z } from "zod";

export const STAFF_BROADCAST_TITLE_MAX = 80;
export const STAFF_BROADCAST_MESSAGE_MAX = 400;
export const STAFF_BROADCAST_COMBINED_MAX = 500;
export const STAFF_BROADCAST_NOTIFICATION_KIND = "staff_broadcast";

export const staffBroadcastNotificationBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Укажите заголовок")
      .max(STAFF_BROADCAST_TITLE_MAX, `Заголовок до ${STAFF_BROADCAST_TITLE_MAX} символов`),
    message: z
      .string()
      .trim()
      .min(1, "Укажите текст")
      .max(STAFF_BROADCAST_MESSAGE_MAX, `Текст до ${STAFF_BROADCAST_MESSAGE_MAX} символов`),
  })
  .superRefine((value, ctx) => {
    const combined = `${value.title}\n${value.message}`;
    if (combined.length > STAFF_BROADCAST_COMBINED_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Заголовок и текст вместе не длиннее ${STAFF_BROADCAST_COMBINED_MAX} символов`,
        path: ["message"],
      });
    }
  });
