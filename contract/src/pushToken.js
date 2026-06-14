import { z } from "zod";

export const PUSH_TOKEN_PLATFORMS = ["ios", "android", "web"];

export const registerPushTokenBodySchema = z.object({
  token: z
    .string()
    .trim()
    .min(10, "token слишком короткий")
    .max(200, "token слишком длинный"),
  platform: z.enum(PUSH_TOKEN_PLATFORMS).optional(),
});

export const removePushTokenBodySchema = z.object({
  token: z.string().trim().min(10).max(200),
});
