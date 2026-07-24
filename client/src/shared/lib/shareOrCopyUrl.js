import { copyTextToClipboard } from "./copyTextToClipboard.js";

/**
 * Web Share API или копирование в буфер (для desktop / LAN без share).
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

  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" ||
      navigator.canShare({ title, text, url: shareUrl }));

  if (canShare) {
    try {
      await navigator.share({
        ...(title ? { title } : {}),
        ...(text ? { text } : {}),
        url: shareUrl,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  await copyTextToClipboard(shareUrl);
  return "copied";
}
