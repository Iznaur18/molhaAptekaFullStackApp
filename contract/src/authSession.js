import { z } from "zod";

import { userPublicProfileSchema } from "./authMe.js";

/** `data` ответов `POST /auth/login`, `/auth/register`, `/auth/refresh`.
 * Токены обязательны для mobile (`X-Auth-Client: mobile`); web — только cookies. */
export const authSessionDataSchema = userPublicProfileSchema
  .extend({
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().min(1).optional(),
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
