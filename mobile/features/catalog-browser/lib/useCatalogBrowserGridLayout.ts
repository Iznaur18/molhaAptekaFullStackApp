import {
  catalogBrowserProductGridResolvers,
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
} from "@/features/catalog-browser/lib/catalogBrowserGridConstants";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export {
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
};

export const useCatalogBrowserGridLayout = () =>
  useProductGridLayout(
    SCREEN_CONTENT_PADDING_HORIZONTAL,
    catalogBrowserProductGridResolvers,
  );
