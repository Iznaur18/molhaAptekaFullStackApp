import { useLayoutEffect, useRef } from "react";

import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CatalogCategoriesGrid.css";

/**
 * @typedef {{
 *   categoryId?: string;
 *   slug?: string;
 *   labelRu: string;
 * }} CatalogBrowserBreadcrumbItem
 */

/**
 * @param {{
 *   items?: CatalogBrowserBreadcrumbItem[] | null;
 *   label?: string | null;
 *   onCatalogRootClick?: (() => void) | null;
 *   onItemClick?: ((item: CatalogBrowserBreadcrumbItem, index: number) => void) | null;
 * }} props
 */
export function CatalogBrowserBreadcrumb({
  items = null,
  label = null,
  onCatalogRootClick = null,
  onItemClick = null,
}) {
  const listRef = useRef(/** @type {HTMLOListElement | null} */ (null));

  const segments =
    Array.isArray(items) && items.length > 0
      ? items
      : String(label ?? "")
          .split(" › ")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((labelRu) => ({ labelRu }));

  const trailKey = segments
    .map((segment) => `${segment.categoryId ?? ""}:${segment.labelRu}`)
    .join("|");

  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) {
      return;
    }
    listEl.scrollLeft = listEl.scrollWidth;
  }, [trailKey]);

  return (
    <div className="catalog-categories-browser__toolbar">
      <nav
        className="catalog-categories-browser__breadcrumb"
        aria-label={HOME_PAGE_UI.BREADCRUMB_CATALOG}
      >
        <ol ref={listRef} className="catalog-categories-browser__breadcrumb-list">
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
            const categoryId =
              typeof segment.categoryId === "string" ? segment.categoryId.trim() : "";
            const canNavigate = !isCurrent && typeof onItemClick === "function";
            const segmentLabel = String(segment.labelRu ?? "").trim();

            return (
              <li
                key={`${categoryId || segment.slug || index}:${segmentLabel}`}
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
                    {segmentLabel}
                  </span>
                ) : canNavigate ? (
                  <button
                    type="button"
                    className="catalog-categories-browser__breadcrumb-item catalog-categories-browser__breadcrumb-item_button"
                    onClick={() => onItemClick(segment, index)}
                  >
                    {segmentLabel}
                  </button>
                ) : (
                  <span className="catalog-categories-browser__breadcrumb-item">
                    {segmentLabel}
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
