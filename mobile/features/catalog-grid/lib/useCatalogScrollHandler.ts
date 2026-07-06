import { useAnimatedScrollHandler } from "react-native-reanimated";

import { useCatalogScrollAnimation } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";

export const useCatalogScrollHandler = () => {
  const scrollAnimation = useCatalogScrollAnimation();
  const scrollY = scrollAnimation?.scrollY;
  const scrollDirection = scrollAnimation?.scrollDirection;

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      if (!scrollY || !scrollDirection) {
        return;
      }

      const nextY = event.contentOffset.y;
      scrollDirection.value = nextY >= scrollY.value ? 1 : -1;
      scrollY.value = nextY;
    },
  });
};
