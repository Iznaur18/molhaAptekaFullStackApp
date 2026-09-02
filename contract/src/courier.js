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

/**
 * Ссылка на снимок из private uploads.
 *
 * Проверяем префикс, а не просто «непустую строку»: публичный URL здесь
 * означал бы, что права и ПТС лежат в открытом каталоге.
 *
 * @param {string} message
 */
const courierDocumentUrlSchema = (message) =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .refine((value) => value.startsWith("/upload/private/"), {
      message: "Файл должен быть загружен как документ курьера",
    });

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
  vehiclePhotoFrontUrl: courierDocumentUrlSchema("Добавьте фото авто спереди"),
  vehiclePhotoRearUrl: courierDocumentUrlSchema("Добавьте фото авто сзади"),
  driverLicensePhotoUrl: courierDocumentUrlSchema("Добавьте фото водительских прав"),
  vehicleRegistrationPhotoUrl: courierDocumentUrlSchema("Добавьте фото ПТС"),
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

/** Params курьерских действий: отправление = заказ + продавец. */
export const courierShipmentParamsSchema = z.object({
  orderId: mongoIdSchema,
  sellerId: mongoIdSchema,
});

export const COURIER_HANDOVER_CODE_LENGTH = 4;

/** Body шагов с кодом: передача продавцом и вручение покупателю. */
export const courierHandoverCodeBodySchema = z.object({
  code: z
    .string({ required_error: "Введите код" })
    .trim()
    .regex(/^\d{4}$/, "Код — четыре цифры"),
});

/** Query `GET /couriers/overview` — геопозиция необязательна, влияет на порядок. */
export const courierOverviewQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export const COURIER_DELIVERY_FEE_MIN_RUB = 100;
export const COURIER_DELIVERY_FEE_STEP_RUB = 25;

/** Body `PATCH /order/:orderId/shipment/:sellerId/delivery-fee`. */
export const shipmentDeliveryFeeBodySchema = z.object({
  deliveryFeeRub: z.coerce.number().int().min(COURIER_DELIVERY_FEE_MIN_RUB),
});

/** Body `POST /couriers/shipments/:orderId/:sellerId/payment-confirmed`. */
export const shipmentPaymentConfirmedBodySchema = z.object({
  confirmed: z.coerce.boolean(),
});

export const SELLER_PAYOUT_REQUISITES_MAX_LENGTH = 120;

/** Синхрон с `server/constants/courierConstants.js`. */
export const COURIER_DISPUTE_REASON_MAX_LENGTH = 500;

/**
 * Body `POST /couriers/shipments/:orderId/:sellerId/open-dispute`.
 *
 * Причина необязательна: спор чаще всего открывают, когда сказать нечего
 * кроме «курьер пропал», а требовать текст значит задерживать сигнал.
 */
export const shipmentDisputeBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .max(COURIER_DISPUTE_REASON_MAX_LENGTH)
    .optional()
    .default(""),
});

export const SHIPMENT_DISPUTE_OUTCOME_RETURNED = "returned";
export const SHIPMENT_DISPUTE_OUTCOME_CONFIRMED = "confirmed";

/** Body `POST /staff/shipment-disputes/:orderId/:sellerId/resolve`. */
export const staffResolveDisputeBodySchema = z.object({
  outcome: z.enum([
    SHIPMENT_DISPUTE_OUTCOME_RETURNED,
    SHIPMENT_DISPUTE_OUTCOME_CONFIRMED,
  ]),
});

/** Query `GET /staff/shipment-disputes`. */
export const staffDisputeListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

/**
 * Публичные поля авто из `courierProfile`, если пользователь их указал.
 *
 * @param {Record<string, unknown> | null | undefined} courierProfile
 * @returns {{ vehicleMake: string; vehicleColor: string; vehiclePlate: string } | null}
 */
export function getCourierVehiclePublicFields(courierProfile) {
  if (!courierProfile || typeof courierProfile !== "object") {
    return null;
  }

  const vehicleMake = String(courierProfile.vehicleMake ?? "").trim();
  const vehicleColor = String(courierProfile.vehicleColor ?? "").trim();
  const vehiclePlate = String(courierProfile.vehiclePlate ?? "").trim();

  if (!vehicleMake && !vehicleColor && !vehiclePlate) {
    return null;
  }

  return { vehicleMake, vehicleColor, vehiclePlate };
}

/**
 * @param {{ vehicleMake?: string; vehicleColor?: string; vehiclePlate?: string } | null | undefined} vehicle
 */
export function formatCourierVehicleDisplay(vehicle) {
  if (!vehicle) {
    return "";
  }

  return [vehicle.vehicleMake, vehicle.vehicleColor, vehicle.vehiclePlate]
    .filter(Boolean)
    .join(", ");
}

/**
 * Для GET /user/:id — не отдаём права, ПТС и служебные поля модерации.
 *
 * @param {Record<string, unknown> | null | undefined} courierProfile
 * @param {{ isFullAccess?: boolean }} [options]
 */
export function sanitizeCourierProfileForViewer(courierProfile, options = {}) {
  if (!courierProfile || typeof courierProfile !== "object") {
    return undefined;
  }

  if (options.isFullAccess === true) {
    return courierProfile;
  }

  const vehicle = getCourierVehiclePublicFields(courierProfile);
  if (!vehicle) {
    return undefined;
  }

  const moderationStatus = String(courierProfile.moderationStatus ?? "").trim();

  return {
    ...(moderationStatus ? { moderationStatus } : {}),
    ...vehicle,
  };
}
