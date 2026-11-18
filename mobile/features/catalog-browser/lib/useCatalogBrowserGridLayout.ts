import {
  catalogBrowserProductGridResolvers,
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
} from "@/features/catalog-browser/lib/catalogBrowserGridConstants";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";

export {
  CATALOG_BROWSER_GRID_GAP,
  CATALOG_BROWSER_PAGE_PADDING,
  resolveCatalogBrowserGridColumns,
};

export const useCatalogBrowserGridLayout = () =>
  useProductGridLayout(undefined, catalogBrowserProductGridResolvers);
