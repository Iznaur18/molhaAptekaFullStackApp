import { useAnimatedScrollHandler } from "react-native-reanimated";

import { useCatalogScrollAnimation } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import {
  homeCatalogTabBarRevealDistance,
  homeCatalogTabBarRevealProgress,
  homeCatalogTabBarScrollEnabled,
  resolveHomeCatalogTabBarRevealProgress,
} from "@/shared/model/homeCatalogTabBarVisibility";

export const useCatalogScrollHandler = () => {
  const scrollAnimation = useCatalogScrollAnimation();
  const scrollY = scrollAnimation?.scrollY;
  const scrollDirection = scrollAnimation?.scrollDirection;

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const nextY = event.contentOffset.y;

      if (scrollY && scrollDirection) {
        scrollDirection.value = nextY >= scrollY.value ? 1 : -1;
        scrollY.value = nextY;
      }

      if (homeCatalogTabBarScrollEnabled.value === 1) {
        homeCatalogTabBarRevealProgress.value = resolveHomeCatalogTabBarRevealProgress(
          nextY,
          homeCatalogTabBarRevealDistance.value,
        );
      }
    },
  });
};
