import { z } from "zod";

/** Макс. длина URL соцсети / сайта в профиле. */
export const USER_SOCIAL_LINK_URL_MAX_LENGTH = 500;

/** Макс. длина ника / номера в поле ввода (не сайт). */
export const USER_SOCIAL_LINK_HANDLE_MAX_LENGTH = 100;

/**
 * Фиксированные слоты соцсетей профиля (id = поле User / PATCH).
 * @type {ReadonlyArray<{ id: string; labelRu: string; placeholderRu: string }>}
 */
export const USER_SOCIAL_LINK_FIELDS = Object.freeze([
  { id: "socialTelegramUrl", labelRu: "Telegram", placeholderRu: "@ник или ник" },
  { id: "socialInstagramUrl", labelRu: "Instagram", placeholderRu: "ник" },
  { id: "socialVkUrl", labelRu: "VK", placeholderRu: "ник или id123" },
  { id: "socialYoutubeUrl", labelRu: "YouTube", placeholderRu: "@канал" },
  { id: "socialWhatsappUrl", labelRu: "WhatsApp", placeholderRu: "+7…" },
  { id: "socialWebsiteUrl", labelRu: "Сайт", placeholderRu: "https://…" },
]);

/** @type {readonly string[]} */
export const USER_SOCIAL_LINK_FIELD_IDS = Object.freeze(
  USER_SOCIAL_LINK_FIELDS.map((field) => field.id),
);

/** @typedef {(typeof USER_SOCIAL_LINK_FIELD_IDS)[number]} UserSocialLinkFieldId */

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

const TELEGRAM_HANDLE_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;
const INSTAGRAM_HANDLE_RE = /^[a-zA-Z0-9._]{1,30}$/;
const VK_SCREEN_RE = /^(?:id\d{1,12}|[a-zA-Z][a-zA-Z0-9_.]{1,31})$/;
const YOUTUBE_HANDLE_RE = /^@?[a-zA-Z0-9._-]{3,30}$/;

/**
 * @param {string} value
 * @returns {boolean}
 */
const hasUrlScheme = (value) => /^[a-z][a-z0-9+.-]*:/i.test(value);

/**
 * @param {string} value
 * @returns {string}
 */
const stripAt = (value) => (value.startsWith("@") ? value.slice(1) : value);

/**
 * @param {string} value
 * @returns {string}
 */
const digitsOnly = (value) => value.replace(/\D/g, "");

/**
 * @param {string} host
 * @param {string} pathname
 * @returns {string | null}
 */
const firstPathSegment = (pathname) => {
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] ?? "";
  return segment.length > 0 ? segment : null;
};

/**
 * @param {string} raw
 * @param {readonly string[]} hosts
 * @returns {string | null}
 */
const tryExtractHandleFromHostPath = (raw, hosts) => {
  const normalized = raw.replace(/^\/+/, "");
  const lower = normalized.toLowerCase();
  for (const host of hosts) {
    const prefix = `${host}/`;
    if (lower === host || lower.startsWith(prefix)) {
      const path = normalized.slice(host.length).replace(/^\//, "");
      const handle = path.split(/[/?#]/)[0] ?? "";
      return handle.length > 0 ? decodeURIComponent(handle) : null;
    }
  }
  return null;
};

/**
 * @param {string} raw
 * @param {readonly string[]} hosts
 * @returns {string | null}
 */
const tryExtractHandleFromHttpUrl = (raw, hosts) => {
  try {
    const parsed = new URL(raw);
    if (!/^https?:$/i.test(parsed.protocol)) return null;
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (!hosts.includes(host)) return null;
    return firstPathSegment(parsed.pathname);
  } catch {
    return null;
  }
};

/**
 * @param {UserSocialLinkFieldId} fieldId
 * @param {string} raw
 * @returns {{ ok: true; url: string | null } | { ok: false; message: string }}
 */
export function normalizeSocialLinkToStoredUrl(fieldId, raw) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") {
    return { ok: true, url: null };
  }

  if (trimmed.length > USER_SOCIAL_LINK_URL_MAX_LENGTH) {
    return {
      ok: false,
      message: `Ссылка не длиннее ${USER_SOCIAL_LINK_URL_MAX_LENGTH} символов`,
    };
  }

  if (fieldId === "socialWebsiteUrl") {
    if (!isHttpUrl(trimmed)) {
      return {
        ok: false,
        message: "Сайт: укажите корректную ссылку (http:// или https://)",
      };
    }
    try {
      const parsed = new URL(trimmed);
      return { ok: true, url: parsed.toString().replace(/\/$/, "") };
    } catch {
      return {
        ok: false,
        message: "Сайт: укажите корректную ссылку (http:// или https://)",
      };
    }
  }

  if (fieldId === "socialWhatsappUrl") {
    if (hasUrlScheme(trimmed) || /wa\.me\//i.test(trimmed)) {
      return {
        ok: false,
        message: "WhatsApp: укажите номер телефона, не ссылку",
      };
    }
    const digits = digitsOnly(trimmed);
    if (digits.length < 10 || digits.length > 15) {
      return {
        ok: false,
        message: "WhatsApp: укажите номер телефона с кодом страны",
      };
    }
    return { ok: true, url: `https://wa.me/${digits}` };
  }

  if (hasUrlScheme(trimmed) && !isHttpUrl(trimmed)) {
    return { ok: false, message: "Укажите ник без ссылки" };
  }

  /** @type {Record<string, { hosts: string[]; build: (handle: string) => string; validate: (handle: string) => boolean; label: string }>} */
  const networks = {
    socialTelegramUrl: {
      hosts: ["t.me", "telegram.me"],
      build: (handle) => `https://t.me/${handle}`,
      validate: (handle) => TELEGRAM_HANDLE_RE.test(handle),
      label: "Telegram",
    },
    socialInstagramUrl: {
      hosts: ["instagram.com"],
      build: (handle) => `https://instagram.com/${handle}`,
      validate: (handle) => INSTAGRAM_HANDLE_RE.test(handle),
      label: "Instagram",
    },
    socialVkUrl: {
      hosts: ["vk.com", "vk.ru", "m.vk.com"],
      build: (handle) => `https://vk.com/${handle}`,
      validate: (handle) => VK_SCREEN_RE.test(handle),
      label: "VK",
    },
    socialYoutubeUrl: {
      hosts: ["youtube.com", "m.youtube.com", "youtu.be"],
      build: (handle) => {
        const withAt = handle.startsWith("@") ? handle : `@${handle}`;
        return `https://youtube.com/${withAt}`;
      },
      validate: (handle) => YOUTUBE_HANDLE_RE.test(handle),
      label: "YouTube",
    },
  };

  const network = networks[fieldId];
  if (!network) {
    return { ok: false, message: "Неизвестное поле соцсети" };
  }

  let handle = null;
  if (isHttpUrl(trimmed)) {
    return {
      ok: false,
      message: `${network.label}: укажите ник, не ссылку`,
    };
  }

  handle = tryExtractHandleFromHostPath(trimmed, network.hosts) ?? stripAt(trimmed);
  handle = String(handle).trim();
  if (
    fieldId === "socialYoutubeUrl" ||
    fieldId === "socialTelegramUrl" ||
    fieldId === "socialInstagramUrl"
  ) {
    handle = stripAt(handle);
  }

  if (handle.length > USER_SOCIAL_LINK_HANDLE_MAX_LENGTH) {
    return {
      ok: false,
      message: `${network.label}: ник не длиннее ${USER_SOCIAL_LINK_HANDLE_MAX_LENGTH} символов`,
    };
  }

  if (!network.validate(handle)) {
    return {
      ok: false,
      message: `${network.label}: некорректный ник`,
    };
  }

  return { ok: true, url: network.build(handle) };
}

/**
 * Хранимый URL → значение для инпута (ник / номер; сайт — URL).
 * @param {UserSocialLinkFieldId} fieldId
 * @param {unknown} stored
 * @returns {string}
 */
export function storedSocialUrlToInputValue(fieldId, stored) {
  if (typeof stored !== "string" || stored.trim() === "") {
    return "";
  }
  const trimmed = stored.trim();

  if (fieldId === "socialWebsiteUrl") {
    return trimmed;
  }

  if (fieldId === "socialWhatsappUrl") {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.replace(/^www\./i, "").toLowerCase() === "wa.me") {
        const digits = digitsOnly(parsed.pathname);
        return digits.length > 0 ? `+${digits}` : "";
      }
    } catch {
      return "";
    }
    return "";
  }

  /** @type {Record<string, string[]>} */
  const hostsByField = {
    socialTelegramUrl: ["t.me", "telegram.me"],
    socialInstagramUrl: ["instagram.com"],
    socialVkUrl: ["vk.com", "vk.ru", "m.vk.com"],
    socialYoutubeUrl: ["youtube.com", "m.youtube.com", "youtu.be"],
  };
  const hosts = hostsByField[fieldId];
  if (!hosts) return "";

  const handle = isHttpUrl(trimmed)
    ? tryExtractHandleFromHttpUrl(trimmed, hosts)
    : null;
  if (handle == null) return "";

  if (fieldId === "socialYoutubeUrl") {
    return handle.startsWith("@") ? handle : `@${handle}`;
  }
  return handle;
}

/**
 * @param {UserSocialLinkFieldId} fieldId
 * @param {unknown} value
 * @returns {string | null}
 */
export function validateSocialLinkInput(fieldId, value) {
  const trimmed = String(value ?? "").trim();
  if (trimmed === "") return null;
  const result = normalizeSocialLinkToStoredUrl(fieldId, trimmed);
  return result.ok ? null : result.message;
}

const clearableOptionalString = z
  .union([z.string(), z.null(), z.literal("")])
  .optional();

/**
 * @param {UserSocialLinkFieldId} fieldId
 */
export function createSocialLinkBodySchema(fieldId) {
  return clearableOptionalString.transform((value, ctx) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    const result = normalizeSocialLinkToStoredUrl(fieldId, String(value).trim());
    if (!result.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message,
      });
      return z.NEVER;
    }
    return result.url;
  });
}

/** Поля соцсетей для `updateProfileBodySchema`. */
export const userSocialLinksBodyShape = Object.fromEntries(
  USER_SOCIAL_LINK_FIELD_IDS.map((id) => [id, createSocialLinkBodySchema(id)]),
);

/** @deprecated use createSocialLinkBodySchema — оставлено для совместимости импортов */
export const clearableSocialHttpUrlSchema = createSocialLinkBodySchema(
  "socialWebsiteUrl",
);
