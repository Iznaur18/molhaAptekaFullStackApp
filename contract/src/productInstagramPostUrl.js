import { z } from "zod";

/** Макс. длина URL поста Instagram на товаре. */
export const PRODUCT_INSTAGRAM_POST_URL_MAX_LENGTH = 500;

export const PRODUCT_INSTAGRAM_POST_URL_INVALID_MESSAGE =
  "Укажите ссылку на пост Instagram: /p/, /reel/ или /tv/";

/** @type {readonly ["post", "reel", "tv"]} */
export const INSTAGRAM_MEDIA_KINDS = Object.freeze(["post", "reel", "tv"]);

const SHORTCODE_RE = /^[A-Za-z0-9_-]{5,64}$/;

/**
 * @typedef {(typeof INSTAGRAM_MEDIA_KINDS)[number]} InstagramMediaKind
 * @typedef {{
 *   shortcode: string;
 *   mediaKind: InstagramMediaKind;
 *   postUrl: string;
 *   embedUrl: string;
 * }} ParsedInstagramPostUrl
 */

/**
 * @param {string} input
 * @returns {ParsedInstagramPostUrl | null}
 */
export function parseInstagramPostUrl(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed || trimmed.length > PRODUCT_INSTAGRAM_POST_URL_MAX_LENGTH) {
    return null;
  }

  let url;
  try {
    url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "instagram.com") {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  /** @type {Record<string, InstagramMediaKind>} */
  const kindMap = { p: "post", reel: "reel", tv: "tv" };
  const segment = parts[0].toLowerCase();
  const mediaKind = kindMap[segment];
  if (!mediaKind) {
    return null;
  }

  const shortcode = parts[1];
  if (!SHORTCODE_RE.test(shortcode)) {
    return null;
  }

  const pathKind = mediaKind === "post" ? "p" : mediaKind;
  const postUrl = `https://www.instagram.com/${pathKind}/${shortcode}/`;
  const embedUrl = `https://www.instagram.com/${pathKind}/${shortcode}/embed/`;

  return { shortcode, mediaKind, postUrl, embedUrl };
}

/**
 * @param {unknown} input
 * @returns {string | null}
 */
export function validateInstagramPostUrlInput(input) {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) {
    return null;
  }
  return parseInstagramPostUrl(trimmed) ? null : PRODUCT_INSTAGRAM_POST_URL_INVALID_MESSAGE;
}

export const productInstagramPostUrlFieldSchema = z
  .string()
  .trim()
  .max(PRODUCT_INSTAGRAM_POST_URL_MAX_LENGTH)
  .refine((value) => value === "" || parseInstagramPostUrl(value) != null, {
    message: PRODUCT_INSTAGRAM_POST_URL_INVALID_MESSAGE,
  });
