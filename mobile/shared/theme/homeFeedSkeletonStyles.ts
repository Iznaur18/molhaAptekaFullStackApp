import { PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO } from "@izibuy/design-tokens";

import {
  PRODUCT_CARD_MOBILE_CATALOG_LAYOUT as MCL,
  resolveProductCardCatalogGridContentBelowImageHeight,
} from "@/entities/product/lib/productCardMobileCatalogLayout";
import {
  CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_TITLE_PADDING_X,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { SITE_HEADER_BANNER_LAYOUT } from "@/shared/lib/siteHeaderBannerLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Плейсхолдеры блоков главной ленты на время загрузки данных.
 * Габариты повторяют реальные блоки, чтобы приход данных из API
 * не сдвигал вёрстку первой отрисовки.
 */
export const useHomeFeedSkeletonStyles = createThemedStyles((theme) => ({
  bannerPlaceholder: {
    width: "100%",
    height: SITE_HEADER_BANNER_LAYOUT.height,
    borderRadius: SITE_HEADER_BANNER_LAYOUT.radius,
    backgroundColor: theme.colors.surfaceMuted,
  },
  bannerPlaceholderEdgeToEdge: {
    borderRadius: 0,
  },
  /* Строка заголовка подборки: fontSize 16 ≈ 19px строки. */
  curatedTitleLine: {
    width: 144,
    height: 19,
    marginBottom: CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM,
    marginHorizontal: CURATED_PRODUCT_LIST_HOME_TITLE_PADDING_X,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  curatedPricePlaceholder: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  catalogTile: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    paddingBottom: MCL.bottomPadding,
  },
  catalogTileImage: {
    width: "100%",
    aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
    backgroundColor: theme.colors.surfaceMuted,
  },
  catalogTileContent: {
    height: resolveProductCardCatalogGridContentBelowImageHeight(),
    paddingHorizontal: MCL.contentInsetX,
    paddingTop: MCL.bodyGap,
    gap: MCL.bodyGap * 2,
  },
  catalogTileLine: {
    height: 12,
    width: "85%",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  catalogTileLineShort: {
    width: "55%",
  },
}));
