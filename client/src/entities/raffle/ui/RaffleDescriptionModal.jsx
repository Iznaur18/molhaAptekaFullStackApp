import { useEffect } from "react";

import { RAFFLE_FEATURED_BANNER_UI } from "../../../shared/config/appUiCopy.js";

import "./RaffleDescriptionModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   title: string;
 *   description: string;
 *   onClose: () => void;
 * }} props
 */
export function RaffleDescriptionModal({ isOpen, title, description, onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="raffle-description-modal__backdrop" role="presentation">
      <section
        className="raffle-description-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="raffle-description-modal-title"
      >
        <header className="raffle-description-modal__header">
          <h3 id="raffle-description-modal-title">
            {RAFFLE_FEATURED_BANNER_UI.DESCRIPTION_MODAL_TITLE}
          </h3>
          <button
            type="button"
            className="app-btn app-btn--primary raffle-description-modal__close"
            onClick={onClose}
          >
            {RAFFLE_FEATURED_BANNER_UI.CLOSE}
          </button>
        </header>
        <p className="raffle-description-modal__raffle-title">{title}</p>
        <p className="raffle-description-modal__text">{description}</p>
      </section>
    </div>
  );
}
