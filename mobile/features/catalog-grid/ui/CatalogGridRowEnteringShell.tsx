import { memo, useMemo, type ReactNode } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { createCatalogGridRowEntering } from "@/features/catalog-grid/lib/catalogGridRowEnteringAnimation";
import { catalogGridRowStyles } from "@/features/catalog-grid/lib/catalogGridLayout";
import { useCatalogScrollAnimation } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";

type CatalogGridRowEnteringShellProps = {
  children: ReactNode;
  rowIndex?: number;
  disableEntering?: boolean;
};

export const CatalogGridRowEnteringShell = ({
  children,
  rowIndex = 0,
  disableEntering = false,
}: CatalogGridRowEnteringShellProps) => {
  const scrollAnimation = useCatalogScrollAnimation();
  const entering = useMemo(
    () =>
      !disableEntering && scrollAnimation
        ? createCatalogGridRowEntering(scrollAnimation.scrollDirection, rowIndex)
        : undefined,
    [disableEntering, rowIndex, scrollAnimation],
  );
  if (!entering) {
    return <View style={catalogGridRowStyles.shell}>{children}</View>;
  }

  return (
    <Animated.View entering={entering} style={catalogGridRowStyles.shell}>
      {children}
    </Animated.View>
  );
};
