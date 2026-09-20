import { z } from "zod";

/**
 * СДЭК подключается per-seller: у каждого продавца свой договор и свои ключи
 * (docs/product/cdek-per-seller-v1.md). Платформа за его отправки не платит,
 * поэтому и ключи платформенными быть не могут.
 */

/** Боевой контур. */
export const CDEK_API_BASE_URL_PROD = "https://api.cdek.ru/v2";
/** Тестовый контур: те же методы, отправки не создаются реально. */
export const CDEK_API_BASE_URL_TEST = "https://api.edu.cdek.ru/v2";

/** @type {readonly ["prod", "test"]} */
export const CDEK_ENVIRONMENTS = ["prod", "test"];
export const CDEK_ENVIRONMENT_PROD = "prod";
export const CDEK_ENVIRONMENT_TEST = "test";

export const CDEK_ACCOUNT_MAX_LENGTH = 128;
export const CDEK_SECURE_MAX_LENGTH = 128;

/** Токен СДЭК живёт час; обновляем заранее, чтобы не ловить 401 на середине. */
export const CDEK_TOKEN_TTL_MS = 55 * 60 * 1000;
export const CDEK_HTTP_TIMEOUT_MS = 15_000;

export const CDEK_NOT_CONNECTED_MESSAGE =
  "СДЭК у этого продавца не подключён: нет ключей API";
export const CDEK_INVALID_CREDENTIALS_MESSAGE =
  "СДЭК не принял ключи: проверьте Account и Secure password";
export const CDEK_UNAVAILABLE_MESSAGE = "СДЭК временно недоступен, попробуйте позже";

/**
 * @param {string | null | undefined} environment
 * @returns {string}
 */
export function resolveCdekBaseUrl(environment) {
  return environment === CDEK_ENVIRONMENT_TEST
    ? CDEK_API_BASE_URL_TEST
    : CDEK_API_BASE_URL_PROD;
}

/** Body `PUT /user/me/cdek-credentials`. */
export const cdekCredentialsBodySchema = z.object({
  account: z
    .string({ required_error: "Укажите Account из кабинета СДЭК" })
    .trim()
    .min(1, "Укажите Account из кабинета СДЭК")
    .max(CDEK_ACCOUNT_MAX_LENGTH),
  secure: z
    .string({ required_error: "Укажите Secure password из кабинета СДЭК" })
    .trim()
    .min(1, "Укажите Secure password из кабинета СДЭК")
    .max(CDEK_SECURE_MAX_LENGTH),
  environment: z.enum(CDEK_ENVIRONMENTS).optional(),
});

/**
 * Что отдаём наружу о подключении. Секрет не отдаём никогда — только признак
 * «подключено» и маска, чтобы продавец узнал свой ключ.
 */
export const cdekConnectionStateSchema = z.object({
  connected: z.boolean(),
  environment: z.enum(CDEK_ENVIRONMENTS),
  accountMasked: z.string(),
  validatedAt: z.coerce.date().nullable(),
  lastError: z.string(),
});

/**
 * Маска ключа: последние 4 символа, остальное скрыто.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function maskCdekAccount(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.length <= 4) return "••••";
  return `••••${text.slice(-4)}`;
}
