import { ChevronRight } from "lucide-react";

import { CURATED_LIST_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";

import "./CuratedListCarouselHeader.css";

const VIEW_ALL_CHEVRON_SIZE_PX = 24;

/**
 * Заголовок карусели + «Все» справа.
 * Пока кнопка-заглушка: перехода на страницу подборки ещё нет.
 *
 * @param {{ title: string }} props
 */
export function CuratedListCarouselHeader({ title }) {
  return (
    <div className="curated-list-carousel-header">
      <h2 className="curated-list-carousel-header__title">{title}</h2>
      <button
        type="button"
        className="curated-list-carousel-header__view-all"
        aria-label={CURATED_LIST_CAROUSEL_UI.VIEW_ALL_ARIA(title)}
      >
        <span>{CURATED_LIST_CAROUSEL_UI.VIEW_ALL}</span>
        <ChevronRight
          className="curated-list-carousel-header__view-all-icon"
          size={VIEW_ALL_CHEVRON_SIZE_PX}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
