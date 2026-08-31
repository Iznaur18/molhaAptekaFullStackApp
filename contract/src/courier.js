import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { optionalLimitQuery, optionalPageQuery } from "./queryHelpers.js";

/** Синхрон с `server/constants/courierConstants.js`. */
export const COURIER_MODERATION_NONE = "none";
export const COURIER_MODERATION_PENDING = "pending";
export const COURIER_MODERATION_APPROVED = "approved";
export const COURIER_MODERATION_REJECTED = "rejected";

export const COURIER_MODERATION_STATUSES = [
  COURIER_MODERATION_NONE,
  COURIER_MODERATION_PENDING,
  COURIER_MODERATION_APPROVED,
  COURIER_MODERATION_REJECTED,
];

export const COURIER_VEHICLE_MAKE_MAX_LENGTH = 60;
export const COURIER_VEHICLE_COLOR_MAX_LENGTH = 30;
export const COURIER_VEHICLE_PLATE_MAX_LENGTH = 15;
export const COURIER_MODERATION_COMMENT_MAX_LENGTH = 500;

/** Body `POST /courier/application` — заявка курьера с данными авто. */
export const courierApplicationBodySchema = z.object({
  vehicleMake: z
    .string({ required_error: "Укажите марку и модель авто" })
    .trim()
    .min(2, "Укажите марку и модель авто")
    .max(COURIER_VEHICLE_MAKE_MAX_LENGTH),
  vehicleColor: z
    .string({ required_error: "Укажите цвет авто" })
    .trim()
    .min(2, "Укажите цвет авто")
    .max(COURIER_VEHICLE_COLOR_MAX_LENGTH),
  vehiclePlate: z
    .string({ required_error: "Укажите госномер" })
    .trim()
    .min(5, "Укажите госномер полностью")
    .max(COURIER_VEHICLE_PLATE_MAX_LENGTH),
});

/** Query `GET /staff/couriers` — очередь модерации. */
export const staffCourierListQuerySchema = z.object({
  status: z
    .enum([
      COURIER_MODERATION_PENDING,
      COURIER_MODERATION_APPROVED,
      COURIER_MODERATION_REJECTED,
    ])
    .optional()
    .default(COURIER_MODERATION_PENDING),
  page: optionalPageQuery,
  limit: optionalLimitQuery,
});

export const staffCourierParamsSchema = z.object({
  userId: mongoIdSchema,
});

/**
 * Body `PATCH /staff/couriers/:userId/moderation`.
 *
 * Причина обязательна при отказе: курьер должен понимать, что исправить,
 * иначе он переподаёт ту же заявку по кругу.
 */
export const staffCourierModerationBodySchema = z
  .object({
    nextStatus: z.enum([COURIER_MODERATION_APPROVED, COURIER_MODERATION_REJECTED]),
    comment: z
      .string()
      .trim()
      .max(COURIER_MODERATION_COMMENT_MAX_LENGTH)
      .optional()
      .default(""),
  })
  .superRefine((body, ctx) => {
    if (body.nextStatus === COURIER_MODERATION_REJECTED && !body.comment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comment"],
        message: "Укажите причину отказа",
      });
    }
  });
