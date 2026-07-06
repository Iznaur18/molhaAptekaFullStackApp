import { useMemo, type ReactNode } from "react";
import Animated from "react-native-reanimated";

import { createCatalogGridRowEntering } from "@/features/catalog-grid/lib/catalogGridRowEnteringAnimation";
import { useCatalogScrollAnimation } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";

type CatalogGridRowEnteringShellProps = {
  children: ReactNode;
  rowIndex?: number;
};

export const CatalogGridRowEnteringShell = ({
  children,
  rowIndex = 0,
}: CatalogGridRowEnteringShellProps) => {
  const scrollAnimation = useCatalogScrollAnimation();
  const entering = useMemo(
    () =>
      scrollAnimation
        ? createCatalogGridRowEntering(scrollAnimation.scrollDirection, rowIndex)
        : undefined,
    [rowIndex, scrollAnimation],
  );

  if (!entering) {
    return children;
  }

  return <Animated.View entering={entering}>{children}</Animated.View>;
};
