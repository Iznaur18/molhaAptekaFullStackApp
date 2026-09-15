import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../entities/product/ui/productImageTokens.css";
import "../../../shared/ui/Skeleton/skeleton.css";
import "./CatalogGridSkeleton.css";

const SKELETON_CARD_COUNT = 9;

/**
 * Плейсхолдер сетки каталога: первая загрузка и догрузка страницы внизу ленты.
 * Карточка повторяет геометрию настоящей карточки ленты (фото, название,
 * цена, отзывы, бейдж, продавец), поэтому замена скелетона карточками не
 * сдвигает вёрстку (CLS).
 *
 * @param {{ cardCount?: number; ariaLabel?: string }} [props]
 */
export function CatalogGridSkeleton({
  cardCount = SKELETON_CARD_COUNT,
  ariaLabel = HOME_PAGE_UI.LOADING_CATALOG,
}) {
  return (
    <div
      className="app-shell__grid catalog-grid-skeleton"
      role="status"
      aria-label={ariaLabel}
    >
      {Array.from({ length: cardCount }, (_, index) => (
        <div key={index} className="app-shell__cell" aria-hidden="true">
          <div className="catalog-grid-skeleton__card">
            <span className="iz-skeleton catalog-grid-skeleton__image" />
            <span className="catalog-grid-skeleton__content">
              <span className="iz-skeleton iz-skeleton_line catalog-grid-skeleton__title" />
              <span className="iz-skeleton iz-skeleton_line catalog-grid-skeleton__price" />
              <span className="iz-skeleton iz-skeleton_line catalog-grid-skeleton__rating" />
              <span className="iz-skeleton catalog-grid-skeleton__badge" />
              <span className="iz-skeleton iz-skeleton_line catalog-grid-skeleton__seller" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
