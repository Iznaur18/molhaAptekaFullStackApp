import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
} from "@/features/catalog-browser/lib/catalogBrowserGridConstants";

export {
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
} from "@/features/catalog-browser/lib/catalogBrowserGridConstants";

export const useCatalogBrowserGridLayout = () => {
  const { width: screenWidth } = useWindowDimensions();

  return useMemo(() => {
    const columns = resolveCatalogBrowserGridColumns(screenWidth);
    const contentWidth = screenWidth - CATALOG_BROWSER_PAGE_PADDING * 2;
    const tileWidth =
      (contentWidth - CATALOG_BROWSER_GRID_GAP * (columns - 1)) / columns;

    return {
      tileWidth,
      contentWidth,
      gap: CATALOG_BROWSER_GRID_GAP,
      padding: CATALOG_BROWSER_PAGE_PADDING,
      columns,
    };
  }, [screenWidth]);
};
