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
  { id: "socialTelegramUrl", labelRu: "Telegram", placeholderRu: "ник или t.me/ник" },
  { id: "socialInstagramUrl", labelRu: "Instagram", placeholderRu: "ник или ссылка" },
  { id: "socialVkUrl", labelRu: "VK", placeholderRu: "ник, id123 или ссылка" },
  { id: "socialYoutubeUrl", labelRu: "YouTube", placeholderRu: "@канал или ссылка" },
  { id: "socialWhatsappUrl", labelRu: "WhatsApp", placeholderRu: "+7…" },
  { id: "socialWebsiteUrl", labelRu: "Сайт", placeholderRu: "example.com" },
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
 * @param {string} host
 * @returns {string}
 */
const stripWww = (host) => host.replace(/^www\./i, "").toLowerCase();

/**
 * @param {string} raw
 * @param {readonly string[]} hosts
 * @returns {string | null}
 */
const tryExtractHandleFromHostPath = (raw, hosts) => {
  const normalized = raw.replace(/^\/+/, "");
  const lower = normalized.toLowerCase();
  for (const host of hosts) {
    for (const candidate of [host, `www.${host}`]) {
      const prefix = `${candidate}/`;
      if (lower === candidate || lower.startsWith(prefix)) {
        const path = normalized.slice(candidate.length).replace(/^\//, "");
        const handle = path.split(/[/?#]/)[0] ?? "";
        return handle.length > 0 ? decodeURIComponent(handle) : null;
      }
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
    const host = stripWww(parsed.hostname);
    if (!hosts.includes(host)) return null;
    return firstPathSegment(parsed.pathname);
  } catch {
    return null;
  }
};

/**
 * YouTube: @handle, /c/name, /user/name — иначе null (channel/UC… храним как URL).
 * @param {string} pathname
 * @returns {string | null}
 */
const extractYoutubeHandleFromPath = (pathname) => {
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts[0].startsWith("@")) return parts[0];
  if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
    return parts[1];
  }
  if (parts[0] === "channel" || parts[0] === "watch" || parts[0] === "shorts") {
    return null;
  }
  return parts[0];
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
    const candidate = isHttpUrl(trimmed)
      ? trimmed
      : hasUrlScheme(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    if (!isHttpUrl(candidate)) {
      return {
        ok: false,
        message: "Сайт: укажите корректную ссылку (например https://example.com)",
      };
    }
    try {
      const parsed = new URL(candidate);
      return { ok: true, url: parsed.toString().replace(/\/$/, "") };
    } catch {
      return {
        ok: false,
        message: "Сайт: укажите корректную ссылку (например https://example.com)",
      };
    }
  }

  if (fieldId === "socialWhatsappUrl") {
    let digits = "";
    if (isHttpUrl(trimmed) || /^(?:www\.)?wa\.me\//i.test(trimmed)) {
      const rawUrl = isHttpUrl(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;
      try {
        const parsed = new URL(rawUrl);
        if (stripWww(parsed.hostname) !== "wa.me") {
          return {
            ok: false,
            message: "WhatsApp: укажите номер телефона или ссылку wa.me",
          };
        }
        digits = digitsOnly(parsed.pathname);
      } catch {
        return {
          ok: false,
          message: "WhatsApp: укажите номер телефона или ссылку wa.me",
        };
      }
    } else if (hasUrlScheme(trimmed)) {
      return {
        ok: false,
        message: "WhatsApp: укажите номер телефона или ссылку wa.me",
      };
    } else {
      digits = digitsOnly(trimmed);
    }
    if (digits.length < 10 || digits.length > 15) {
      return {
        ok: false,
        message: "WhatsApp: укажите номер телефона с кодом страны",
      };
    }
    return { ok: true, url: `https://wa.me/${digits}` };
  }

  if (hasUrlScheme(trimmed) && !isHttpUrl(trimmed)) {
    return {
      ok: false,
      message: "Укажите ник или http(s)-ссылку на профиль",
    };
  }

  /** @type {Record<string, { hosts: string[]; build: (handle: string) => string; validate: (handle: string) => boolean; label: string; hint: string }>} */
  const networks = {
    socialTelegramUrl: {
      hosts: ["t.me", "telegram.me"],
      build: (handle) => `https://t.me/${handle}`,
      validate: (handle) => TELEGRAM_HANDLE_RE.test(handle),
      label: "Telegram",
      hint: "латиница, 5–32 символа (например nick_name)",
    },
    socialInstagramUrl: {
      hosts: ["instagram.com"],
      build: (handle) => `https://instagram.com/${handle}`,
      validate: (handle) => INSTAGRAM_HANDLE_RE.test(handle),
      label: "Instagram",
      hint: "латиница, цифры, точка или _ (например nick.name)",
    },
    socialVkUrl: {
      hosts: ["vk.com", "vk.ru", "m.vk.com"],
      build: (handle) => `https://vk.com/${handle}`,
      validate: (handle) => VK_SCREEN_RE.test(handle),
      label: "VK",
      hint: "ник или id123",
    },
    socialYoutubeUrl: {
      hosts: ["youtube.com", "m.youtube.com", "youtu.be"],
      build: (handle) => {
        const withAt = handle.startsWith("@") ? handle : `@${handle}`;
        return `https://youtube.com/${withAt}`;
      },
      validate: (handle) => YOUTUBE_HANDLE_RE.test(handle),
      label: "YouTube",
      hint: "@канал или ник канала",
    },
  };

  const network = networks[fieldId];
  if (!network) {
    return { ok: false, message: "Неизвестное поле соцсети" };
  }

  /** @type {string | null} */
  let handle = null;

  if (isHttpUrl(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const host = stripWww(parsed.hostname);
      if (!network.hosts.includes(host)) {
        return {
          ok: false,
          message: `${network.label}: ссылка должна вести на ${network.hosts[0]}`,
        };
      }
      if (fieldId === "socialYoutubeUrl") {
        const ytHandle = extractYoutubeHandleFromPath(parsed.pathname);
        if (ytHandle == null) {
          return { ok: true, url: parsed.toString().replace(/\/$/, "") };
        }
        handle = ytHandle;
      } else {
        handle = firstPathSegment(parsed.pathname);
      }
    } catch {
      return {
        ok: false,
        message: `${network.label}: некорректная ссылка`,
      };
    }
  } else {
    handle =
      tryExtractHandleFromHostPath(trimmed, network.hosts) ?? stripAt(trimmed);
  }

  handle = String(handle ?? "").trim();
  if (
    fieldId === "socialYoutubeUrl" ||
    fieldId === "socialTelegramUrl" ||
    fieldId === "socialInstagramUrl"
  ) {
    handle = stripAt(handle);
  }

  if (handle.length === 0) {
    return {
      ok: false,
      message: `${network.label}: укажите ник (${network.hint})`,
    };
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
      message: `${network.label}: некорректный ник (${network.hint})`,
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
    ? fieldId === "socialYoutubeUrl"
      ? (() => {
          try {
            const parsed = new URL(trimmed);
            return extractYoutubeHandleFromPath(parsed.pathname);
          } catch {
            return null;
          }
        })()
      : tryExtractHandleFromHttpUrl(trimmed, hosts)
    : null;
  if (handle == null) {
    if (fieldId === "socialYoutubeUrl" && isHttpUrl(trimmed)) {
      return trimmed;
    }
    return "";
  }

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
