import {
  PRODUCT_CATALOG_NEAR_REGION_SECTION_TITLE,
  splitCatalogNearProducts,
} from "@molha/api-contract";
import {
  interleaveCatalogTier3Banners,
  shouldShowProductTier3BannerFullWidth,
  type CatalogTier3Product,
} from "@izibuy/shared-lib";

export type CatalogGridProduct = CatalogTier3Product & { _id: string };

export type CatalogGridRow =
  | { kind: "tier3-banner"; key: string; product: CatalogGridProduct }
  | { kind: "product-cells"; key: string; products: CatalogGridProduct[] }
  | { kind: "section-header"; key: string; title: string };

type BuildCatalogGridRowsOptions = {
  showFullWidthTier3Banners?: boolean;
  isMineMode?: boolean;
  catalogNear?: boolean;
  nearRegionSectionTitle?: string;
  viewerRegionCode?: string | null;
};

const buildCatalogGridRowsInternal = (
  products: CatalogGridProduct[],
  columnCount: number,
  {
    showFullWidthTier3Banners = false,
    isMineMode = false,
  }: BuildCatalogGridRowsOptions = {},
): CatalogGridRow[] => {
  const shouldInterleave = showFullWidthTier3Banners && !isMineMode;
  const displayProducts = interleaveCatalogTier3Banners(products, columnCount, {
    enabled: shouldInterleave,
  });

  const safeColumnCount = Math.max(1, Math.floor(Number(columnCount)) || 1);
  const rows: CatalogGridRow[] = [];
  let buffer: CatalogGridProduct[] = [];

  const flushBuffer = () => {
    if (buffer.length === 0) {
      return;
    }
    rows.push({
      kind: "product-cells",
      key: buffer.map((product) => product._id).join("-"),
      products: buffer,
    });
    buffer = [];
  };

  for (const product of displayProducts) {
    if (
      shouldShowProductTier3BannerFullWidth(product, {
        isMineMode,
        showFullWidthTier3Banners,
      })
    ) {
      flushBuffer();
      rows.push({
        kind: "tier3-banner",
        key: `tier3-${product._id}`,
        product,
      });
      continue;
    }

    buffer.push(product);
    if (buffer.length >= safeColumnCount) {
      const cells = buffer.slice(0, safeColumnCount);
      buffer = buffer.slice(safeColumnCount);
      rows.push({
        kind: "product-cells",
        key: cells.map((item) => item._id).join("-"),
        products: cells,
      });
    }
  }

  flushBuffer();
  return rows;
};

export const buildCatalogGridRows = (
  products: CatalogGridProduct[],
  columnCount: number,
  options: BuildCatalogGridRowsOptions = {},
): CatalogGridRow[] => {
  if (options.catalogNear && !options.isMineMode) {
    const { withDistance, withoutDistance } = splitCatalogNearProducts(products);
    const baseOptions = { ...options, catalogNear: false };
    const nearRows = buildCatalogGridRowsInternal(withDistance, columnCount, baseOptions);
    if (withoutDistance.length === 0) {
      return nearRows;
    }
    return [
      ...nearRows,
      {
        kind: "section-header",
        key: "catalog-near-region",
        title:
          options.nearRegionSectionTitle ?? PRODUCT_CATALOG_NEAR_REGION_SECTION_TITLE,
      },
      ...buildCatalogGridRowsInternal(withoutDistance, columnCount, baseOptions),
    ];
  }

  return buildCatalogGridRowsInternal(products, columnCount, options);
};
