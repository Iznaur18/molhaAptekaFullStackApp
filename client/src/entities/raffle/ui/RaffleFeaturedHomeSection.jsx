import { useCallback } from "react";

import { RAFFLE_FEATURED_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";

import "./RaffleFeaturedHomeSection.css";

/**
 * @param {{
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => object | null;
 * }} props
 */
// eslint-disable-next-line no-unused-vars -- getManage зарезервирован: контролы управления розыгрышем пока не рендерятся в этой секции (см. useHomeFeaturedContent.getFeaturedRaffleManage)
export function RaffleFeaturedHomeSection({ raffles, onOpenProducts, getManage }) {
  const openFirstRaffleProducts = useCallback(() => {
    const firstId = Array.isArray(raffles) ? raffles[0]?._id : null;
    if (!firstId) {
      return;
    }
    onOpenProducts(String(firstId));
  }, [onOpenProducts, raffles]);

  if (!Array.isArray(raffles) || raffles.length === 0) {
    return null;
  }

  return (
    <section
      className="raffle-featured-home-section"
      aria-label={RAFFLE_FEATURED_CAROUSEL_UI.SECTION_ARIA}
    >
      <button
        type="button"
        className="raffle-featured-home-section__reveal"
        onClick={openFirstRaffleProducts}
      >
        <span className="raffle-featured-home-section__reveal-label">
          {RAFFLE_FEATURED_CAROUSEL_UI.SHOW}
        </span>
      </button>
    </section>
  );
}
