/** Умеренная высота hero auth-экранов (login / register / guest profile). */
export const AUTH_HERO_HEIGHT_MIN = 170;
export const AUTH_HERO_HEIGHT_MAX = 280;
export const AUTH_HERO_HEIGHT_RATIO = 0.28;

export const resolveAuthHeroHeight = (viewportHeight: number): number =>
  Math.round(
    Math.min(
      AUTH_HERO_HEIGHT_MAX,
      Math.max(AUTH_HERO_HEIGHT_MIN, viewportHeight * AUTH_HERO_HEIGHT_RATIO),
    ),
  );
