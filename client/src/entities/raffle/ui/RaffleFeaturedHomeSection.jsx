import { useCallback, useState } from "react";

import { RAFFLE_FEATURED_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { RaffleFeaturedCarousel } from "./RaffleFeaturedCarousel.jsx";

import "./RaffleFeaturedHomeSection.css";

/**
 * @param {{
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   activeIndex: number;
 *   onActiveIndexChange: (index: number) => void;
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => object | null;
 * }} props
 */
export function RaffleFeaturedHomeSection({
  raffles,
  activeIndex,
  onActiveIndexChange,
  onOpenProducts,
  getManage,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!Array.isArray(raffles) || raffles.length === 0) {
    return null;
  }

  const label = isExpanded
    ? RAFFLE_FEATURED_CAROUSEL_UI.HIDE
    : RAFFLE_FEATURED_CAROUSEL_UI.SHOW;

  return (
    <section className="raffle-featured-home-section" aria-label={label}>
      <button
        type="button"
        className="raffle-featured-home-section__reveal"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <span className="raffle-featured-home-section__reveal-label">{label}</span>
      </button>
      {isExpanded ? (
        <RaffleFeaturedCarousel
          raffles={raffles}
          activeIndex={activeIndex}
          onActiveIndexChange={onActiveIndexChange}
          onOpenProducts={onOpenProducts}
          getManage={getManage}
        />
      ) : null}
    </section>
  );
}
