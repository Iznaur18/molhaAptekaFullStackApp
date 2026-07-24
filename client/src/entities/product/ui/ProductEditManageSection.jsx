import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";

import { ProductManageToggleRow } from "./ProductManageToggleRow.jsx";
import "./ProductEditManageSection.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   errorMessage?: string;
 *   canEdit?: boolean;
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
  onSetAvailability,
  onSetAuction,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  errorMessage = "",
  canEdit = true,
  canToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  disabled = false,
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
}) {
  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showAuctionToggle = typeof onSetAuction === "function" && canEdit;
  const isAuctionEnabled = product.productAuctionEnabled === true;
  const isInstallmentEnabled = product.productInstallmentEnabled === true;
  const showRaffleToggle =
    sellerRaffleActive && typeof onToggleRaffleParticipation === "function";
  const showInstallmentButton = typeof onOpenInstallmentProgram === "function";
  const isRaffleParticipant = isProductRaffleParticipant(product);
  const canOpenInstallment =
    canOpenInstallmentProgram &&
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
      PRODUCT_MODERATION_APPROVED;
  const showOpenSalesHint = hasOpenSalesLocked && (showAuctionToggle || showVisibility);

  const actionsLocked =
    disabled ||
    isAvailabilityTogglePending ||
    isAuctionTogglePending ||
    isRaffleParticipationPending ||
    !canEdit;

  const auctionActionsLocked = actionsLocked || hasOpenSalesLocked;
  const visibilityActionsLocked = actionsLocked || hasOpenSalesLocked;

  return (
    <section
      className="product-edit-manage"
      aria-label={CREATE_PRODUCT_MODAL_UI.MANAGE_SECTION_ARIA}
    >
      {errorMessage ? (
        <p className="product-edit-manage__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {showOpenSalesHint ? (
        <div className="product-edit-manage__warning" role="alert">
          <span className="product-edit-manage__warning-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </span>
          <p className="product-edit-manage__warning-text">
            {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
          </p>
        </div>
      ) : null}
      <div className="product-edit-manage__toggles">
        {showAuctionToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_TITLE}
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_AUCTION_HINT}
            checked={isAuctionEnabled}
            disabled={auctionActionsLocked}
            pending={isAuctionTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AUCTION_TOGGLE_PENDING}
            onCheckedChange={() => {
              if (product._id == null || auctionActionsLocked) {
                return;
              }
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
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              isRaffleParticipationPending ||
              !canOpenInstallment
            }
            variant="installment"
            onPress={() => onOpenInstallmentProgram?.()}
          />
        ) : null}
        {showVisibility ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_TITLE_VISIBLE}
            description={
              isListedForOthers
                ? CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_HINT_VISIBLE
                : CREATE_PRODUCT_MODAL_UI.MANAGE_VISIBILITY_HINT_HIDDEN
            }
            checked={isListedForOthers}
            disabled={visibilityActionsLocked}
            pending={isAvailabilityTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
            onCheckedChange={() => {
              if (product._id == null || visibilityActionsLocked) {
                return;
              }
              void onSetAvailability(String(product._id), !isListedForOthers);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
