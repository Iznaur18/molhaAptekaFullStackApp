import { useMemo } from "react";

import { ProductCardImageLoadingContext } from "../../../entities/product/ui/product-card/productCardImageLoadingContext.js";
import { buildCatalogGridBlocks } from "../lib/buildCatalogGridBlocks.js";
import {
  CATALOG_GRID_BLOCK_EAGER_IMAGES_FROM_BLOCK,
  CATALOG_GRID_BLOCK_ROWS,
} from "../lib/catalogGridVirtualizationConstants.js";
import {
  CATALOG_GRID_BLOCK_KEY_ATTRIBUTE,
  useCatalogGridBlockWindow,
} from "../model/useCatalogGridBlockWindow.js";

/**
 * Лента блоками: по несколько рядов сетки в обычном потоке. Блоки вдали от
 * экрана сворачиваются в заглушку своей высоты (см. useCatalogGridBlockWindow).
 *
 * `getItemKey` и `isFullWidth` должны быть стабильными (useCallback): от них
 * зависит нарезка на блоки.
 *
 * @template T
 * @param {{
 *   items: T[];
 *   columnCount: number;
 *   renderItem: (item: T) => import('react').ReactNode;
 *   getItemKey: (item: T) => string;
 *   isFullWidth?: (item: T) => boolean;
 *   keyPrefix?: string;
 *   ariaLabel: string;
 * }} props
 */
export function CatalogGridBlocks({
  items,
  columnCount,
  renderItem,
  getItemKey,
  isFullWidth,
  keyPrefix = "",
  ariaLabel,
}) {
  const blocks = useMemo(
    () =>
      buildCatalogGridBlocks(items, columnCount, CATALOG_GRID_BLOCK_ROWS, {
        isFullWidth,
        keyPrefix,
      }).map((block) => ({
        ...block,
        signature: block.items.map((item) => getItemKey(item)).join("|"),
      })),
    [columnCount, getItemKey, isFullWidth, items, keyPrefix],
  );
  const { getBlockRef, getCollapsedHeight } = useCatalogGridBlockWindow({ blocks });

  return (
    <div className="app-shell__grid-blocks" role="list" aria-label={ariaLabel}>
      {blocks.map((block, blockIndex) => {
        const collapsedHeight = getCollapsedHeight(block.key, block.signature);
        const blockProps = {
          ref: getBlockRef(block.key),
          [CATALOG_GRID_BLOCK_KEY_ATTRIBUTE]: block.key,
          role: "none",
        };

        if (collapsedHeight != null) {
          // Один пустой элемент, плитки рисует CSS по числу колонок. Раньше тут
          // была пустышка на каждый товар, и за ~120 страниц ленты на странице
          // копились тысячи лишних элементов (18.09.2026).
          return (
            <div
              key={block.key}
              {...blockProps}
              className="app-shell__grid app-shell__grid-block app-shell__grid-block--collapsed"
              style={{
                height: `${collapsedHeight}px`,
                "--catalog-collapsed-columns": columnCount,
              }}
              data-catalog-block-count={block.items.length}
              aria-hidden="true"
            />
          );
        }

        const cards = block.items.map((item) => renderItem(item));
        return (
          <div
            key={block.key}
            {...blockProps}
            className="app-shell__grid app-shell__grid-block"
          >
            {blockIndex >= CATALOG_GRID_BLOCK_EAGER_IMAGES_FROM_BLOCK ? (
              <ProductCardImageLoadingContext.Provider value="eager">
                {cards}
              </ProductCardImageLoadingContext.Provider>
            ) : (
              cards
            )}
          </div>
        );
      })}
    </div>
  );
}
