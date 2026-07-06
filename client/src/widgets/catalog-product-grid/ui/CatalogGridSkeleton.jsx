import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../entities/product/ui/productImageTokens.css";
import "./CatalogGridSkeleton.css";

const SKELETON_CARD_COUNT = 9;

/**
 * Плейсхолдер сетки каталога на время первой загрузки товаров.
 * Повторяет геометрию `.app-shell__grid` / `.app-shell__cell`, чтобы
 * появление реальных карточек не сдвигало вёрстку (CLS).
 *
 * @param {{ cardCount?: number }} [props]
 */
export function CatalogGridSkeleton({ cardCount = SKELETON_CARD_COUNT }) {
  return (
    <div
      className="app-shell__grid catalog-grid-skeleton"
      role="status"
      aria-label={HOME_PAGE_UI.LOADING_CATALOG}
    >
      {Array.from({ length: cardCount }, (_, index) => (
        <div key={index} className="app-shell__cell" aria-hidden="true">
          <div className="catalog-grid-skeleton__card">
            <span className="catalog-grid-skeleton__image" />
            <span className="catalog-grid-skeleton__content">
              <span className="catalog-grid-skeleton__line catalog-grid-skeleton__line_wide" />
              <span className="catalog-grid-skeleton__line" />
              <span className="catalog-grid-skeleton__line catalog-grid-skeleton__line_short" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
