import { resolveYandexMapsOpenCandidates } from "@izibuy/shared-lib";

/**
 * Открывает Яндекс.Навигатор / Карты / веб-фолбэк.
 * @param {{ lat?: number | null; lon?: number | null; address?: string | null }} point
 */
export function openYandexMapsRoute(point) {
  const candidates = resolveYandexMapsOpenCandidates(point);
  if (candidates.length === 0) {
    return;
  }

  // В браузере deep link'и часто не срабатывают — сразу веб, если нет coords app-схем.
  // Пробуем первый candidate (navi/maps) через hidden iframe+timeout, иначе web.
  const webUrl = candidates[candidates.length - 1];
  const appCandidates = candidates.slice(0, -1);

  if (appCandidates.length === 0 || typeof window === "undefined") {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  let opened = false;
  const start = Date.now();
  const onBlur = () => {
    opened = true;
  };
  window.addEventListener("blur", onBlur);

  const tryNext = (index) => {
    if (index >= appCandidates.length) {
      window.removeEventListener("blur", onBlur);
      if (!opened || Date.now() - start < 400) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    window.location.href = appCandidates[index];
    window.setTimeout(() => {
      if (opened) {
        window.removeEventListener("blur", onBlur);
        return;
      }
      tryNext(index + 1);
    }, 600);
  };

  tryNext(0);
}
