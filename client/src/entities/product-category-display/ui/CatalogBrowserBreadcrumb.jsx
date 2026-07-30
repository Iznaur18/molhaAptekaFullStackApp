import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CatalogCategoriesGrid.css";

const TRAIL_SEP = " › ";

/**
 * @param {{
 *   label: string;
 *   onCatalogRootClick?: (() => void) | null;
 * }} props
 */
export function CatalogBrowserBreadcrumb({ label, onCatalogRootClick = null }) {
  const segments = label.split(TRAIL_SEP).map((part) => part.trim()).filter(Boolean);

  return (
    <div className="catalog-categories-browser__toolbar">
      <nav
        className="catalog-categories-browser__breadcrumb"
        aria-label={HOME_PAGE_UI.BREADCRUMB_CATALOG}
      >
        <ol className="catalog-categories-browser__breadcrumb-list">
          <li className="catalog-categories-browser__breadcrumb-node">
            {onCatalogRootClick ? (
              <button
                type="button"
                className="catalog-categories-browser__breadcrumb-root"
                onClick={onCatalogRootClick}
              >
                {HOME_PAGE_UI.BREADCRUMB_CATALOG}
              </button>
            ) : (
              <span className="catalog-categories-browser__breadcrumb-root catalog-categories-browser__breadcrumb-root_static">
                {HOME_PAGE_UI.BREADCRUMB_CATALOG}
              </span>
            )}
          </li>
          {segments.map((segment, index) => {
            const isCurrent = index === segments.length - 1;
            return (
              <li
                key={`${index}:${segment}`}
                className="catalog-categories-browser__breadcrumb-node"
              >
                <span
                  className="catalog-categories-browser__breadcrumb-sep"
                  aria-hidden="true"
                >
                  ›
                </span>
                {isCurrent ? (
                  <span
                    className="catalog-categories-browser__breadcrumb-current"
                    aria-current="page"
                  >
                    {segment}
                  </span>
                ) : (
                  <span className="catalog-categories-browser__breadcrumb-item">
                    {segment}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
