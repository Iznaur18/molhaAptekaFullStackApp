import { copyTextToClipboard } from "./copyTextToClipboard.js";

/**
 * Web Share API или копирование в буфер (для desktop / LAN без share).
 * Share вызывается первым, без await до него — иначе жест клика сгорает.
 *
 * @param {{
 *   title?: string;
 *   text?: string;
 *   url: string;
 * }} params
 * @returns {Promise<"shared" | "copied" | "cancelled">}
 */
export async function shareOrCopyUrl({ title, text, url }) {
  const shareUrl = String(url ?? "").trim();
  if (!shareUrl) {
    throw new Error("Share url is empty");
  }

  const result = await copyAndShareUrl({ title, text, url: shareUrl });
  if (result === "shared" || result === "cancelled") {
    return result;
  }
  return "copied";
}

/**
 * Копирует URL и открывает системный share (как партнёрская кнопка).
 * Критично: `navigator.share()` стартует синхронно в обработчике клика,
 * до любого `await` — иначе Chromium/iOS отдают NotAllowedError.
 *
 * @param {{
 *   title?: string;
 *   text?: string;
 *   url: string;
 * }} params
 * @returns {Promise<"shared" | "copied" | "cancelled">}
 */
export async function copyAndShareUrl({ title, text, url }) {
  const shareUrl = String(url ?? "").trim();
  if (!shareUrl) {
    throw new Error("Share url is empty");
  }

  // Не класть один и тот же URL в text и url — Windows/Chrome Share склеивает в «url url».
  const rawText = text != null ? String(text).trim() : "";
  const shareText = rawText && rawText !== shareUrl ? rawText : "";
  /** @type {ShareData} */
  const fullData = {
    ...(title ? { title: String(title) } : {}),
    ...(shareText ? { text: shareText } : {}),
    url: shareUrl,
  };

  /** @type {Promise<"shared" | "cancelled" | "unavailable">} */
  let shareOutcome = Promise.resolve("unavailable");

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    /** @type {ShareData} */
    let payload = fullData;
    if (typeof navigator.canShare === "function" && !navigator.canShare(fullData)) {
      payload = { text: shareText || shareUrl };
      if (!navigator.canShare(payload)) {
        payload = fullData;
      }
    }

    // SYNC call — сохраняем transient user activation
    shareOutcome = navigator
      .share(payload)
      .then(() => /** @type {const} */ ("shared"))
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") {
          return /** @type {const} */ ("cancelled");
        }
        console.error("Share sheet failed", error);
        return /** @type {const} */ ("unavailable");
      });
  }

  try {
    await copyTextToClipboard(shareUrl);
  } catch (error) {
    const shareStatus = await shareOutcome;
    if (shareStatus === "shared" || shareStatus === "cancelled") {
      return shareStatus;
    }
    throw error;
  }

  const shareStatus = await shareOutcome;
  if (shareStatus === "shared" || shareStatus === "cancelled") {
    return shareStatus;
  }
  return "copied";
}
