import { useCallback, useState } from "react";

import { RAFFLE_FEATURED_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { HomeFeaturedRaffleModal } from "./HomeFeaturedRaffleModal.jsx";

import "./RaffleFeaturedHomeSection.css";

/**
 * @param {{
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => object | null;
 * }} props
 */
export function RaffleFeaturedHomeSection({ raffles, onOpenProducts, getManage }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const wrapManage = useCallback(
    (raffle) => {
      const manage = getManage?.(raffle) ?? null;
      if (!manage) {
        return null;
      }

      return {
        ...manage,
        onEdit: () => {
          closeModal();
          manage.onEdit?.();
        },
        onDelete: () => {
          closeModal();
          manage.onDelete?.();
        },
      };
    },
    [closeModal, getManage],
  );

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
        onClick={openModal}
      >
        <span className="raffle-featured-home-section__reveal-label">
          {RAFFLE_FEATURED_CAROUSEL_UI.SHOW}
        </span>
      </button>

      <HomeFeaturedRaffleModal
        visible={isModalOpen}
        raffles={raffles}
        onClose={closeModal}
        onOpenProducts={onOpenProducts}
        getManage={wrapManage}
      />
    </section>
  );
}
