import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  PRODUCT_GRID_GAP,
  resolveLayoutContentWidth,
  resolveProductGridColumns,
} from "@/shared/lib/screenBreakpoints";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export type ProductGridLayout = {
  columns: number;
  listKey: string;
  gap: number;
  padding: number;
  contentWidth: number;
  tileWidth: number;
};

export const useProductGridLayout = (
  pagePadding: number = SCREEN_CONTENT_PADDING_HORIZONTAL,
): ProductGridLayout => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const layoutWidth = resolveLayoutContentWidth(width);
    const columns = resolveProductGridColumns({ width, height });
    const contentWidth = layoutWidth - pagePadding * 2;
    const gap = PRODUCT_GRID_GAP;
    const tileWidth = (contentWidth - gap * (columns - 1)) / columns;

    return {
      columns,
      listKey: `product-grid-${columns}`,
      gap,
      padding: pagePadding,
      contentWidth,
      tileWidth,
    };
  }, [width, height, pagePadding]);
};
