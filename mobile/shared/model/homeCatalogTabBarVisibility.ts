import { makeMutable, type SharedValue } from "react-native-reanimated";

import { resolveMobileBottomNavLayoutHeight } from "@/shared/lib/mobileBottomNavLayout";

/** 0 — таббар спрятан; 1 — полностью виден. */
export const homeCatalogTabBarRevealProgress: SharedValue<number> = makeMutable(1);

/** 1 — на главной с intro-hero, таббар привязан к scrollY. */
export const homeCatalogTabBarScrollEnabled: SharedValue<number> = makeMutable(0);

/** Дистанция scrollY (px), за которую таббар полностью выезжает (= высота бара). */
export const homeCatalogTabBarRevealDistance: SharedValue<number> = makeMutable(0);

/** progress 1:1 со scrollY: каждый px скролла — 1 px выезда таббара. */
export const resolveHomeCatalogTabBarRevealProgress = (
  scrollY: number,
  revealDistance: number,
): number => {
  "worklet";

  if (revealDistance <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, scrollY / revealDistance));
};

export const syncHomeCatalogTabBarRevealDistance = (safeAreaBottom = 0): void => {
  homeCatalogTabBarRevealDistance.value = resolveMobileBottomNavLayoutHeight(safeAreaBottom);
};

export const setHomeCatalogTabBarScrollLinked = (linked: boolean): void => {
  homeCatalogTabBarScrollEnabled.value = linked ? 1 : 0;
  homeCatalogTabBarRevealProgress.value = linked ? 0 : 1;
};

/**
 * Главная лента: reveal таб-бара ведёт прогресс перехода интро↔лента, а не
 * scrollY. Отвязываем от скролла. `initialReveal` = 0 при старте с интро,
 * 1 — когда hero выключен и лента сразу на переднем фоне.
 */
export const setHomeCatalogTabBarProgressDriven = (initialReveal = 0): void => {
  homeCatalogTabBarScrollEnabled.value = 0;
  homeCatalogTabBarRevealProgress.value = initialReveal;
};

export const resetHomeCatalogTabBarReveal = (): void => {
  homeCatalogTabBarScrollEnabled.value = 0;
  homeCatalogTabBarRevealProgress.value = 1;
};
