import { CatalogGridSkeleton } from "../../../widgets/catalog-product-grid/ui/CatalogGridSkeleton.jsx";
import { RAFFLE_PRODUCTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./RaffleProductsPage.css";
import "./RaffleProductsPageSkeleton.css";

/** Шапка розыгрыша: надзаголовок и название (описание есть не у всех). */
function RaffleHeaderSkeleton({ className }) {
  return (
    <header className={`raffle-products-page__header ${className}`}>
      <div className="raffle-products-page__copy">
        <span className="iz-skeleton iz-skeleton_line raffle-products-skeleton__eyebrow" />
        <span className="iz-skeleton iz-skeleton_line raffle-products-skeleton__title" />
      </div>
    </header>
  );
}

/**
 * Плейсхолдер страницы розыгрыша (`/raffle/:id`) на время загрузки.
 *
 * Раньше здесь был абзац «Загрузка…», и страница разворачивалась из одной
 * строки. Скелетон собран на тех же классах, что и живая страница: фото
 * приза, шапка, прогресс со статистикой и сетка товаров стоят на своих
 * местах на телефоне и на широком экране.
 */
export function RaffleProductsPageSkeleton() {
  return (
    <div
      className="raffle-products-page"
      role="status"
      aria-label={RAFFLE_PRODUCTS_PAGE_UI.LOADING}
    >
      <div className="raffle-products-page__summary-layout" aria-hidden="true">
        <div className="raffle-products-page__hero">
          <div className="raffle-products-page__media">
            <span className="iz-skeleton raffle-products-skeleton__media" />
          </div>
          <RaffleHeaderSkeleton className="raffle-products-page__header_mobile" />
        </div>

        <div className="raffle-products-page__summary-side">
          <section className="raffle-products-page__progress">
            <span className="iz-skeleton raffle-products-skeleton__bar" />
            <div className="raffle-products-page__stats">
              {[0, 1, 2].map((index) => (
                <div key={index} className="raffle-products-page__stat">
                  <span className="iz-skeleton iz-skeleton_line raffle-products-skeleton__stat-label" />
                  <span className="iz-skeleton iz-skeleton_line raffle-products-skeleton__stat-value" />
                </div>
              ))}
            </div>
          </section>
          <RaffleHeaderSkeleton className="raffle-products-page__header_desktop" />
        </div>
      </div>

      {/* У CatalogGridSkeleton свой role="status"; вложенная живая область
          заставила бы скринридер объявить загрузку дважды. */}
      <div className="raffle-products-page__products-block" aria-hidden="true">
        <CatalogGridSkeleton cardCount={6} />
      </div>
    </div>
  );
}
