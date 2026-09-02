/**
 * @param {string} postUrl
 */
export function openProductInstagramPost(postUrl) {
  const url = String(postUrl ?? "").trim();
  if (!url || typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
