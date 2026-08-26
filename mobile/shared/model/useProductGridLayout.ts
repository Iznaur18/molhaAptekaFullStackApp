import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { resolveGridTileWidth } from "@/shared/lib/resolveGridTileWidth";
import { resolveViewportLayoutWidth } from "@/shared/lib/resolveViewportLayoutWidth";
import {
  resolveLayoutContentWidth,
  resolveProductGridColumns,
  resolveProductGridGap,
  type ScreenSizeInput,
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

export type ProductGridLayoutResolvers = {
  resolveColumns: (input: ScreenSizeInput) => number;
  resolveGap: (width: number) => number;
};

export type ProductGridLayoutOptions = {
  /** Ширина, занятая соседней колонкой (sidebar+gap в profile hub). */
  reservedLeadingWidth?: number;
};

const defaultProductGridResolvers: ProductGridLayoutResolvers = {
  resolveColumns: resolveProductGridColumns,
  resolveGap: resolveProductGridGap,
};

export const useProductGridLayout = (
  pagePadding: number = SCREEN_CONTENT_PADDING_HORIZONTAL,
  resolvers: ProductGridLayoutResolvers = defaultProductGridResolvers,
  options: ProductGridLayoutOptions = {},
): ProductGridLayout => {
  const { width, height } = useWindowDimensions();
  const reservedLeadingWidth = options.reservedLeadingWidth ?? 0;

  return useMemo(() => {
    const viewportWidth = resolveViewportLayoutWidth(width);
    const layoutWidth = resolveLayoutContentWidth(viewportWidth);
    const columns = resolvers.resolveColumns({ width: viewportWidth, height });
    const contentWidth = Math.max(
      0,
      layoutWidth - pagePadding * 2 - reservedLeadingWidth,
    );
    const gap = resolvers.resolveGap(viewportWidth);
    const tileWidth = resolveGridTileWidth(contentWidth, columns, gap);

    return {
      columns,
      listKey: `product-grid-${columns}-${contentWidth}`,
      gap,
      padding: pagePadding,
      contentWidth,
      tileWidth,
    };
  }, [width, height, pagePadding, reservedLeadingWidth, resolvers]);
};
