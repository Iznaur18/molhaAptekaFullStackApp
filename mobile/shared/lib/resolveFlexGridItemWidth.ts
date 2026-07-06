import { Platform, type DimensionValue, type ViewStyle } from "react-native";

import { resolveGridTileWidth } from "@/shared/lib/resolveGridTileWidth";

type ResolveFlexGridItemWidthInput = {
  contentWidth: number;
  columns: number;
  gap: number;
};

/**
 * Web: calc от 100% родителя — устойчиво к скроллбару и субпикселям.
 * Native: фиксированная ширина по доступному контенту.
 */
export const resolveFlexGridItemWidthStyle = ({
  contentWidth,
  columns,
  gap,
}: ResolveFlexGridItemWidthInput): ViewStyle => {
  if (columns <= 0) {
    return {};
  }

  if (Platform.OS === "web") {
    const totalGap = gap * Math.max(0, columns - 1);
    // Web-only calc(): react-native-web поддерживает, но RN-типы его не знают.
    return {
      width: `calc((100% - ${totalGap}px) / ${columns})` as unknown as DimensionValue,
    };
  }

  const tileWidth = resolveGridTileWidth(contentWidth, columns, gap);
  return tileWidth > 0 ? { width: tileWidth } : {};
};
