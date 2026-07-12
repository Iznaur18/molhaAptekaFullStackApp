import { forwardRef, type ComponentProps, type Ref } from "react";
import Animated, { useComposedEventHandler } from "react-native-reanimated";

import { useCatalogScrollHandler } from "@/features/catalog-grid/lib/useCatalogScrollHandler";

type CatalogAnimatedFlatListProps<T> = ComponentProps<typeof Animated.FlatList<T>> & {
  /** false — не трекаем scrollY/direction (главная лента). */
  trackCatalogScroll?: boolean;
};

const CatalogAnimatedFlatListInner = <T,>(
  {
    onScroll,
    scrollEventThrottle = 16,
    trackCatalogScroll = true,
    ...props
  }: CatalogAnimatedFlatListProps<T>,
  ref: Ref<Animated.FlatList<T>>,
) => {
  const catalogScrollHandler = useCatalogScrollHandler();
  const scrollHandler = useComposedEventHandler(
    (onScroll != null
      ? trackCatalogScroll
        ? [catalogScrollHandler, onScroll]
        : [onScroll]
      : trackCatalogScroll
        ? [catalogScrollHandler]
        : []) as unknown as Parameters<typeof useComposedEventHandler>[0],
  );

  return (
    <Animated.FlatList
      ref={ref}
      {...props}
      onScroll={scrollHandler}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
};

export const CatalogAnimatedFlatList = forwardRef(CatalogAnimatedFlatListInner) as <T>(
  props: CatalogAnimatedFlatListProps<T> & { ref?: Ref<Animated.FlatList<T>> },
) => ReturnType<typeof CatalogAnimatedFlatListInner>;
