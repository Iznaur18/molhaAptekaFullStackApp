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
 * @template T
 * @param {{
 *   items: T[];
 *   columnCount: number;
 *   renderItem: (item: T) => import('react').ReactNode;
 *   ariaLabel: string;
 * }} props
 */
export function CatalogGridBlocks({ items, columnCount, renderItem, ariaLabel }) {
  const blocks = useMemo(
    () => buildCatalogGridBlocks(items, columnCount, CATALOG_GRID_BLOCK_ROWS),
    [columnCount, items],
  );
  const { getBlockRef, getCollapsedHeight } = useCatalogGridBlockWindow({ blocks });

  return (
    <div className="app-shell__grid-blocks" role="list" aria-label={ariaLabel}>
      {blocks.map((block, blockIndex) => {
        const collapsedHeight = getCollapsedHeight(block.key, block.items.length);
        const isCollapsed = collapsedHeight != null;
        const blockProps = {
          ref: getBlockRef(block.key),
          [CATALOG_GRID_BLOCK_KEY_ATTRIBUTE]: block.key,
          role: "none",
        };

        if (isCollapsed) {
          return (
            <div
              key={block.key}
              {...blockProps}
              className="app-shell__grid app-shell__grid-block app-shell__grid-block--collapsed"
              style={{ height: `${collapsedHeight}px` }}
            >
              {block.items.map((_, index) => (
                <div
                  key={index}
                  className="app-shell__grid-block-skeleton"
                  aria-hidden="true"
                />
              ))}
            </div>
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
