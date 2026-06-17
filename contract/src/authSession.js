import { z } from "zod";

import { userPublicProfileSchema } from "./authMe.js";

/** `data` ответов `POST /auth/login`, `/auth/register`, `/auth/refresh`. */
export const authSessionDataSchema = userPublicProfileSchema
  .extend({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  .passthrough();

/** Body `POST /auth/refresh` для mobile (cookie — fallback для web). */
export const refreshAuthBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .default({});

/** Body `POST /auth/logout` для mobile (инвалидация на server — v2). */
export const logoutAuthBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .default({});
