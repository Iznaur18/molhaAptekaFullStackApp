import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { CURATED_LIST_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";

import {
  CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX,
  CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX,
} from "../lib/curatedCategoryListHomeLayout.js";
import { useCuratedCarouselImageDragScroll } from "../../curated-product-list/lib/useCuratedCarouselImageDragScroll.js";
import { CuratedListViewAllSheet } from "../../curated-product-list/ui/CuratedListViewAllSheet.jsx";
import { CuratedCategoryCompactCard } from "./CuratedCategoryCompactCard.jsx";

import "./CuratedCategoryListCarousel.css";

/**
 * @param {{
 *   title: string;
 *   categories: import('../model/types.js').HomeCuratedCategoryFromApi[];
 *   onOpenCategory: (category: import('../model/types.js').HomeCuratedCategoryFromApi) => void;
 * }} props
 */
export function CuratedCategoryListCarousel({ title, categories, onOpenCategory }) {
  const { ref: scrollRef, dragScrollProps } = useCuratedCarouselImageDragScroll();
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <section
        className="curated-category-list-carousel"
        aria-label={title}
        style={{
          "--curated-visible-cards": String(
            CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX,
          ),
          "--curated-card-gap": `${CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX}px`,
          "--curated-card-min-width": `${CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX}px`,
          "--curated-card-max-width": `${CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX}px`,
        }}
      >
        <div className="curated-category-list-carousel__header">
          <h2 className="curated-category-list-carousel__title">{title}</h2>
          <button
            type="button"
            className="curated-category-list-carousel__view-all"
            aria-label={CURATED_LIST_CAROUSEL_UI.VIEW_ALL_ARIA(title)}
            onClick={() => setIsViewAllOpen(true)}
          >
            {CURATED_LIST_CAROUSEL_UI.VIEW_ALL}
            <ArrowRight size={14} aria-hidden />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="curated-category-list-carousel__scroll"
          {...dragScrollProps}
        >
          <ul className="curated-category-list-carousel__track" role="list">
            {categories.map((category) => (
              <li
                key={category.itemKey}
                className="curated-category-list-carousel__item"
              >
                <CuratedCategoryCompactCard
                  category={category}
                  onOpen={onOpenCategory}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CuratedListViewAllSheet
        isOpen={isViewAllOpen}
        title={title}
        categories={categories}
        onOpenCategory={onOpenCategory}
        onClose={() => setIsViewAllOpen(false)}
      />
    </>
  );
}
