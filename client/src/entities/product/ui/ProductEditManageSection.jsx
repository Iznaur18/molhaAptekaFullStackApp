import { useState } from "react";

import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCard.css";
import "./ProductEditManageSection.css";
import "./ProductSellerManageActions.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onDelete: (productId: string) => void | Promise<void>;
 *   onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   errorMessage?: string;
 *   canEdit?: boolean;
 *   canDelete?: boolean;
 *   canToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import("../model/types.js").ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
 *   disabled?: boolean;
 * }} props
 */
export function ProductEditManageSection({
  product,
  onDelete,
  onSetAvailability,
  onSetAuction,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  errorMessage = "",
  canEdit = true,
  canDelete = true,
  canToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  disabled = false,
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showAuctionToggle = typeof onSetAuction === "function" && canEdit;
  const isAuctionEnabled = product.productAuctionEnabled === true;
  const showDelete = canDelete;
  const showRaffleToggle =
    sellerRaffleActive && typeof onToggleRaffleParticipation === "function";
  const isRaffleParticipant = isProductRaffleParticipant(product);

  const actionsLocked =
    disabled ||
    isDeletePending ||
    isAvailabilityTogglePending ||
    isAuctionTogglePending ||
    isDeleteConfirmOpen ||
    hasOpenSalesLocked ||
    !canEdit;

  const handleDeleteConfirmYes = () => {
    if (product._id == null) return;
    void onDelete(String(product._id));
    setIsDeleteConfirmOpen(false);
  };

  return (
    <section
      className="product-edit-manage"
      aria-label={CREATE_PRODUCT_MODAL_UI.MANAGE_SECTION_ARIA}
    >
      <h3 className="product-edit-manage__title">
        {CREATE_PRODUCT_MODAL_UI.MANAGE_SECTION_TITLE}
      </h3>
      {errorMessage ? (
        <p className="product-edit-manage__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {hasOpenSalesLocked && showDelete ? (
        <p className="product-card__open-sales-hint">
          {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
        </p>
      ) : null}
      {showVisibility ? (
        isAvailabilityTogglePending ? (
          <p className="product-card__availability-pending" aria-live="polite">
            {PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
          </p>
        ) : (
          <div className="product-card__availability">
            <p className="product-card__availability-status">
              {isListedForOthers
                ? PRODUCT_CARD_UI.AVAILABILITY_STATUS_VISIBLE
                : PRODUCT_CARD_UI.AVAILABILITY_STATUS_HIDDEN}
            </p>
            <button
              type="button"
              className="product-card__availability-toggle"
              disabled={actionsLocked}
              onClick={() => {
                if (product._id == null || actionsLocked) return;
                void onSetAvailability(String(product._id), !isListedForOthers);
              }}
            >
              {isListedForOthers
                ? PRODUCT_CARD_UI.HIDE_FROM_CATALOG
                : PRODUCT_CARD_UI.SHOW_IN_CATALOG}
            </button>
          </div>
        )
      ) : null}
      {showAuctionToggle ? (
        isAuctionTogglePending ? (
          <p className="product-card__availability-pending" aria-live="polite">
            {PRODUCT_CARD_UI.AUCTION_TOGGLE_PENDING}
          </p>
        ) : (
          <div className="product-card__availability">
            <p className="product-card__availability-status">
              {isAuctionEnabled
                ? PRODUCT_CARD_UI.AUCTION_STATUS_ON
                : PRODUCT_CARD_UI.AUCTION_STATUS_OFF}
            </p>
            <button
              type="button"
              className="product-card__auction-toggle product-card__availability-toggle"
              disabled={actionsLocked}
              onClick={() => {
                if (product._id == null || actionsLocked) return;
                void onSetAuction(String(product._id), !isAuctionEnabled);
              }}
            >
              {isAuctionEnabled
                ? PRODUCT_CARD_UI.AUCTION_TOGGLE_OFF
                : PRODUCT_CARD_UI.AUCTION_TOGGLE_ON}
            </button>
          </div>
        )
      ) : null}
      {showRaffleToggle ? (
        <button
          type="button"
          className="product-card__raffle-toggle"
          disabled={
            isRaffleParticipationPending ||
            isDeletePending ||
            isAvailabilityTogglePending ||
            isAuctionTogglePending ||
            disabled
          }
          onClick={() => {
            onToggleRaffleParticipation?.(product, !isRaffleParticipant);
          }}
        >
          {isRaffleParticipationPending
            ? PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_PENDING
            : isRaffleParticipant
              ? PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_ON
              : PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_OFF}
        </button>
      ) : null}
      {showDelete ? (
        isDeletePending ? (
          <p className="product-card__delete-pending" aria-live="polite">
            {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
          </p>
        ) : isDeleteConfirmOpen ? (
          <div className="product-card__delete-confirm" role="group">
            <p className="product-card__delete-confirm-question">
              {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
            </p>
            <div className="product-card__delete-confirm-actions">
              <button
                type="button"
                className="product-card__delete-confirm-yes"
                onClick={handleDeleteConfirmYes}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
              </button>
              <button
                type="button"
                className="product-card__delete-confirm-cancel"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="product-card__delete"
            disabled={hasOpenSalesLocked || disabled}
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            {PRODUCT_CARD_UI.DELETE_PRODUCT}
          </button>
        )
      ) : null}
    </section>
  );
}
