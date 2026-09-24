import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Сколько аккаунтов (активный + сохранённые) держит один браузер. */
export const AUTH_LINKED_ACCOUNTS_MAX = 5;

/** `POST /auth/accounts/switch` и `POST /auth/accounts/remove`. */
export const authAccountUserIdBodySchema = z.object({
  userId: mongoIdSchema,
});

export const authLinkedAccountSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userAvatarUrl: z.string().nullable(),
  isPremiumUser: z.boolean(),
  isUserDataConfirmed: z.boolean(),
  /** Этот аккаунт сейчас открыт в браузере. */
  isActive: z.boolean(),
  /**
   * Переключиться без пароля нельзя: сессия отозвана (выход на другом
   * устройстве / смена пароля) или это аккаунт персонала.
   */
  requiresLogin: z.boolean(),
});

export const authLinkedAccountsDataSchema = z.object({
  accounts: z.array(authLinkedAccountSchema),
  maxAccounts: z.number().int(),
});
