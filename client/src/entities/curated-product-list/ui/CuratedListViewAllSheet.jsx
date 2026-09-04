import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { CURATED_LIST_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";
import {
  CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX,
} from "../../curated-category-list/lib/curatedCategoryListHomeLayout.js";
import { CuratedCategoryCompactCard } from "../../curated-category-list/ui/CuratedCategoryCompactCard.jsx";
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX,
} from "../lib/curatedProductListHomeLayout.js";
import { CuratedProductCompactCard } from "./CuratedProductCompactCard.jsx";

import "../../curated-category-list/ui/CuratedCategoryCompactCard.css";
import "./CuratedListViewAllSheet.css";
import "./CuratedProductCompactCard.css";

const TITLE_ID = "curated-list-view-all-sheet-title";

/**
 * Bottom sheet «Все» из curated-карусели.
 * Товары / категории — сетка компактных карточек; клик открывает сущность, sheet не закрывает.
 * Закрытие — клик вне панели / Escape.
 *
 * @param {{
 *   isOpen: boolean;
 *   title: string;
 *   onClose: () => void;
 *   products?: import('../../product/model/types.js').ProductFromApi[];
 *   onOpenProduct?: (product: import('../../product/model/types.js').ProductFromApi) => void;
 *   categories?: import('../../curated-category-list/model/types.js').HomeCuratedCategoryFromApi[];
 *   onOpenCategory?: (category: import('../../curated-category-list/model/types.js').HomeCuratedCategoryFromApi) => void;
 * }} props
 */
export function CuratedListViewAllSheet({
  isOpen,
  title,
  onClose,
  products = [],
  onOpenProduct,
  categories = [],
  onOpenCategory,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);
  const showProducts = products.length > 0 && typeof onOpenProduct === "function";
  const showCategories =
    !showProducts &&
    categories.length > 0 &&
    typeof onOpenCategory === "function";
  const cardGapPx = showCategories
    ? CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX
    : CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX;
  const cardMinPx = showCategories
    ? CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX
    : CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX;
  const cardMaxPx = showCategories
    ? CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX
    : CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX;

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: panelRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "curated-list-view-all-sheet__backdrop",
        isVisible ? "curated-list-view-all-sheet__backdrop--open" : "",
        showCategories ? "curated-list-view-all-sheet__backdrop--categories" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--curated-sheet-card-gap": `${cardGapPx}px`,
        "--curated-sheet-card-min": `${cardMinPx}px`,
        "--curated-sheet-card-max": `${cardMaxPx}px`,
      }}
    >
      <button
        type="button"
        className="curated-list-view-all-sheet__dismiss"
        aria-label={CURATED_LIST_CAROUSEL_UI.SHEET_CLOSE_ARIA}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="curated-list-view-all-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-label={CURATED_LIST_CAROUSEL_UI.SHEET_ARIA}
        tabIndex={-1}
      >
        <div className="curated-list-view-all-sheet__body">
          <h2 id={TITLE_ID} className="curated-list-view-all-sheet__title">
            {title}
          </h2>
          {showProducts ? (
            <ul className="curated-list-view-all-sheet__grid" role="list">
              {products.map((product) => (
                <li key={product._id} className="curated-list-view-all-sheet__grid-item">
                  <CuratedProductCompactCard
                    product={product}
                    onOpen={onOpenProduct}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {showCategories ? (
            <ul
              className="curated-list-view-all-sheet__grid curated-list-view-all-sheet__grid--categories"
              role="list"
            >
              {categories.map((category) => (
                <li
                  key={category.itemKey}
                  className="curated-list-view-all-sheet__grid-item"
                >
                  <CuratedCategoryCompactCard
                    category={category}
                    onOpen={onOpenCategory}
                    showDetails
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
