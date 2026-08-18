import { isChunkLoadError } from "./isChunkLoadError.js";

const STORAGE_KEY = "gitorg:stale-chunk-reload";

/**
 * Один reload на вкладку: новый index.html подтянет актуальные хеши чанков.
 *
 * @param {unknown} error
 * @returns {boolean} true, если инициирован reload
 */
export function reloadOnceOnStaleChunk(error) {
  if (typeof window === "undefined" || !isChunkLoadError(error)) {
    return false;
  }

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    if (window.__gitorgChunkReloaded) {
      return false;
    }
    window.__gitorgChunkReloaded = true;
  }

  window.location.reload();
  return true;
}

/** Сброс после успешного старта, чтобы следующий деплой снова мог reload-нуть. */
export function clearStaleChunkReloadFlag() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage недоступен
  }
  window.__gitorgChunkReloaded = false;
}
