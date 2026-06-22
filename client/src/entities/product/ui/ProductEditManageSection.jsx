import { useState } from "react";

import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import { ProductManageToggleRow } from "./ProductManageToggleRow.jsx";
import "./ProductCard.css";
import "./ProductEditManageSection.css";

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
 *   onOpenInstallmentProgram?: () => void;
 *   canOpenInstallmentProgram?: boolean;
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
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showAuctionToggle = typeof onSetAuction === "function" && canEdit;
  const isAuctionEnabled = product.productAuctionEnabled === true;
  const isInstallmentEnabled = product.productInstallmentEnabled === true;
  const showDelete = canDelete;
  const showRaffleToggle =
    sellerRaffleActive && typeof onToggleRaffleParticipation === "function";
  const showInstallmentButton = typeof onOpenInstallmentProgram === "function";
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
      <div className="product-edit-manage__toggles">
        {showAuctionToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_TITLE}
            titleStatus={
              isAuctionEnabled
                ? CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_STATUS_ACTIVE
                : CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_STATUS_INACTIVE
            }
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_HINT}
            checked={isAuctionEnabled}
            disabled={actionsLocked}
            pending={isAuctionTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AUCTION_TOGGLE_PENDING}
            variant="auction"
            onCheckedChange={() => {
              if (product._id == null || actionsLocked) return;
              void onSetAuction(String(product._id), !isAuctionEnabled);
            }}
          />
        ) : null}
        {showRaffleToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_RAFFLE_TITLE}
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_RAFFLE_HINT}
            checked={isRaffleParticipant}
            disabled={
              isRaffleParticipationPending ||
              isDeletePending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              disabled
            }
            pending={isRaffleParticipationPending}
            pendingLabel={PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_PENDING}
            onCheckedChange={() => {
              onToggleRaffleParticipation?.(product, !isRaffleParticipant);
            }}
          />
        ) : null}
        {showInstallmentButton ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_INSTALLMENT_TITLE}
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_INSTALLMENT_HINT}
            checked={isInstallmentEnabled}
            disabled={
              disabled ||
              isDeletePending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              isRaffleParticipationPending ||
              !canOpenInstallmentProgram
            }
            variant="installment"
            onPress={() => onOpenInstallmentProgram?.()}
          />
        ) : null}
        {showDelete ? (
          isDeletePending ? (
            <ProductManageToggleRow
              title={CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_TITLE}
              description={CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_HINT}
              pending
              pendingLabel={PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
            />
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
            <ProductManageToggleRow
              title={CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_TITLE}
              description={CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_HINT}
              disabled={hasOpenSalesLocked || disabled}
              variant="danger"
              onPress={() => setIsDeleteConfirmOpen(true)}
            />
          )
        ) : null}
        {showVisibility ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_TITLE_VISIBLE}
            titleStatus={
              isListedForOthers
                ? CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_STATUS_VISIBLE
                : CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_STATUS_HIDDEN
            }
            description={
              isListedForOthers
                ? CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_HINT_VISIBLE
                : CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_HINT_HIDDEN
            }
            checked={isListedForOthers}
            disabled={actionsLocked}
            pending={isAvailabilityTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
            onCheckedChange={() => {
              if (product._id == null || actionsLocked) return;
              void onSetAvailability(String(product._id), !isListedForOthers);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
