import { CatalogGridSkeleton } from "../../../widgets/catalog-product-grid/ui/CatalogGridSkeleton.jsx";
import { SELLER_PRODUCTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./SellerProductsPageSkeleton.css";

/**
 * Плейсхолдер витрины продавца на первую загрузку.
 *
 * Раньше здесь был абзац «Загрузка…»: страница схлопывалась в одну строку, а
 * потом разворачивалась в полную вёрстку — заметный скачок. Скелетон держит
 * ту же геометрию, поэтому появление данных ничего не двигает.
 *
 * Сетку товаров не рисуем заново — берём готовый CatalogGridSkeleton, он уже
 * повторяет `.app-shell__grid`.
 */
export function SellerProductsPageSkeleton() {
  return (
    <div
      className="seller-products-page"
      role="status"
      aria-label={SELLER_PRODUCTS_PAGE_UI.LOADING}
    >
      <div className="seller-products-skeleton__nav" aria-hidden="true">
        <span className="iz-skeleton seller-products-skeleton__back" />
        <span className="iz-skeleton iz-skeleton_line seller-products-skeleton__nav-title" />
      </div>

      <div aria-hidden="true">
        <div className="iz-skeleton seller-products-skeleton__banner">
          <span className="iz-skeleton iz-skeleton_circle seller-products-skeleton__avatar" />
        </div>

        <div className="seller-products-skeleton__stats">
          <span className="iz-skeleton seller-products-skeleton__stat" />
          <span className="iz-skeleton seller-products-skeleton__stat" />
          <span className="iz-skeleton seller-products-skeleton__stat" />
        </div>

        <span className="iz-skeleton iz-skeleton_line seller-products-skeleton__name" />
      </div>

      {/* У CatalogGridSkeleton свой role="status"; вложенная живая область
          заставила бы скринридер объявить загрузку дважды. */}
      <div aria-hidden="true">
        <CatalogGridSkeleton cardCount={6} />
      </div>
    </div>
  );
}
