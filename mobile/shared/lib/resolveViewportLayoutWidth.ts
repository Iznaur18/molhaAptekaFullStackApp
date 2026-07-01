import { Platform } from "react-native";

/**
 * На web `window.innerWidth` может быть шире фактической области контента из‑за скроллбара.
 * Для расчёта сеток используем clientWidth — иначе плитки не влезают в ряд (2 вместо 3).
 */
export const resolveViewportLayoutWidth = (windowWidth: number): number => {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return windowWidth;
  }

  const clientWidth = document.documentElement?.clientWidth;
  if (!Number.isFinite(clientWidth) || clientWidth <= 0) {
    return windowWidth;
  }

  return clientWidth;
};
