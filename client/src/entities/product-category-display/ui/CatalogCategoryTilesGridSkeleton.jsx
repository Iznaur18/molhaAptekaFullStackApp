import "../ui/CatalogCategoriesGrid.css";
import "./CatalogCategoryTilesGridSkeleton.css";

const SKELETON_TILE_COUNT = 6;

/**
 * @param {{ tileCount?: number }} [props]
 */
export function CatalogCategoryTilesGridSkeleton({ tileCount = SKELETON_TILE_COUNT }) {
  return (
    <ul
      className="catalog-categories-grid__list catalog-category-tiles-grid-skeleton"
      aria-hidden="true"
    >
      {Array.from({ length: tileCount }, (_, index) => (
        <li key={index} className="catalog-categories-grid__item">
          <div className="catalog-category-tiles-grid-skeleton__card">
            <span className="catalog-category-tiles-grid-skeleton__image" />
            <span className="catalog-category-tiles-grid-skeleton__label" />
          </div>
        </li>
      ))}
    </ul>
  );
}
