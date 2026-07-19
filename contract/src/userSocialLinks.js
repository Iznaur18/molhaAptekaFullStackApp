import { z } from "zod";

/** Макс. длина URL соцсети / сайта в профиле. */
export const USER_SOCIAL_LINK_URL_MAX_LENGTH = 500;

/**
 * Фиксированные слоты соцсетей профиля (id = поле User / PATCH).
 * @type {ReadonlyArray<{ id: string; labelRu: string }>}
 */
export const USER_SOCIAL_LINK_FIELDS = Object.freeze([
  { id: "socialTelegramUrl", labelRu: "Telegram" },
  { id: "socialInstagramUrl", labelRu: "Instagram" },
  { id: "socialVkUrl", labelRu: "VK" },
  { id: "socialYoutubeUrl", labelRu: "YouTube" },
  { id: "socialWhatsappUrl", labelRu: "WhatsApp" },
  { id: "socialWebsiteUrl", labelRu: "Сайт" },
]);

/** @type {readonly string[]} */
export const USER_SOCIAL_LINK_FIELD_IDS = Object.freeze(
  USER_SOCIAL_LINK_FIELDS.map((field) => field.id),
);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\/.+/i.test(value.trim());
}

/**
 * Короткий текст для отображения ссылки (хост + путь).
 * @param {string} url
 * @returns {string}
 */
export function formatSocialLinkDisplay(url) {
  const trimmed = String(url).trim();
  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `${parsed.host}${path}`;
  } catch {
    return trimmed;
  }
}

const clearableOptionalString = z
  .union([z.string(), z.null(), z.literal("")])
  .optional();

/**
 * Пусто / null → null; иначе trim + http(s) URL.
 */
export const clearableSocialHttpUrlSchema = clearableOptionalString
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return String(value).trim();
  })
  .superRefine((value, ctx) => {
    if (value === undefined || value === null) return;
    if (value.length > USER_SOCIAL_LINK_URL_MAX_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Ссылка не длиннее ${USER_SOCIAL_LINK_URL_MAX_LENGTH} символов`,
      });
      return;
    }
    if (!isHttpUrl(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите корректную ссылку (http:// или https://)",
      });
    }
  });

/** Поля соцсетей для `updateProfileBodySchema`. */
export const userSocialLinksBodyShape = Object.fromEntries(
  USER_SOCIAL_LINK_FIELD_IDS.map((id) => [id, clearableSocialHttpUrlSchema]),
);
