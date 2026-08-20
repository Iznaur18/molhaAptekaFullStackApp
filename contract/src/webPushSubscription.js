import { z } from "zod";

export const registerWebPushSubscriptionBodySchema = z.object({
  endpoint: z
    .string()
    .trim()
    .url("endpoint должен быть URL")
    .max(2048, "endpoint слишком длинный"),
  expirationTime: z.number().finite().nullable().optional(),
  keys: z.object({
    p256dh: z.string().trim().min(20).max(256),
    auth: z.string().trim().min(8).max(128),
  }),
});

export const removeWebPushSubscriptionBodySchema = z.object({
  endpoint: z.string().trim().url().max(2048),
});
