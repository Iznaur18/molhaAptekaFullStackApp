import { useState } from "react";

export const AUTH_HERO_HEIGHT_MIN = 170;
export const AUTH_HERO_HEIGHT_MAX = 280;
export const AUTH_HERO_HEIGHT_RATIO = 0.28;

/**
 * @param {number} viewportHeight
 */
export function resolveAuthHeroHeight(viewportHeight) {
  return Math.round(
    Math.min(
      AUTH_HERO_HEIGHT_MAX,
      Math.max(AUTH_HERO_HEIGHT_MIN, viewportHeight * AUTH_HERO_HEIGHT_RATIO),
    ),
  );
}

/** Фиксируем hero на mount (клавиатура не должна дёргать layout). */
export function useStableAuthHeroHeight() {
  const [height] = useState(() =>
    typeof window === "undefined"
      ? AUTH_HERO_HEIGHT_MIN
      : resolveAuthHeroHeight(window.innerHeight),
  );
  return height;
}
