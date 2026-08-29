import { z } from "zod";

export const userPublicProfileSchema = z
  .object({
    _id: z.string(),
    userName: z.string().optional(),
    userFullName: z.string().nullable().optional(),
    email: z.string().optional(),
    isEmailVerified: z.boolean().optional(),
    isPhoneVerified: z.boolean().optional(),
    userRole: z.enum(["user", "admin", "moderator"]).optional(),
    isPremiumUser: z.boolean().optional(),
    isUserDataConfirmed: z.boolean().optional(),
    isBlockedUser: z.boolean().optional(),
    isActiveUser: z.boolean().optional(),
    userLoyaltyPoints: z.number().optional(),
    userLoyaltyPointsReserved: z.number().optional(),
    userAddressGeo: z
      .object({
        lat: z.number().optional(),
        lon: z.number().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export const inAppNotificationSchema = z
  .object({
    _id: z.string(),
    kind: z.string(),
    message: z.string(),
    productId: z.string().nullable().optional(),
    actorUserId: z.string().nullable().optional(),
    createdAt: z.string(),
  })
  .passthrough();

/** `data` ответа `GET /auth/me`. */
export const authMeDataSchema = z.object({
  user: userPublicProfileSchema.nullable(),
  inAppNotifications: z.array(inAppNotificationSchema),
});
