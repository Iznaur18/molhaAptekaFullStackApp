import { useEffect, useState } from "react";

import { isProductAffiliateConfigured, isProductWholesaleConfigured } from "@izibuy/shared-lib";

import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { resolveProductAffiliateOffer } from "../lib/resolveProductAffiliateOffer.js";

import { ProductManageToggleRow } from "./ProductManageToggleRow.jsx";
import "./ProductEditManageSection.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   onSetQa?: (productId: string, productQaEnabled: boolean) => void | Promise<void>;
 *   onSetWholesale?: (productId: string, productWholesaleEnabled: boolean) => void | Promise<void>;
   *   onSetAffiliate?: (
   *     productId: string,
   *     affiliateEnabled: boolean,
   *     product?: import("../model/types.js").ProductFromApi,
   *   ) => void | Promise<void>;
 *   onDelete?: (productId: string) => void | Promise<void>;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   isQaTogglePending?: boolean;
 *   isWholesaleTogglePending?: boolean;
 *   isAffiliateTogglePending?: boolean;
 *   isDeletePending?: boolean;
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
 *   onSetInstallment?: (productId: string, productInstallmentEnabled: boolean) => void | Promise<void | { needsSetup?: boolean }>;
 *   isInstallmentTogglePending?: boolean;
 *   canOpenInstallmentProgram?: boolean;
 *   onOpenWholesaleSettings?: () => void;
 *   onOpenAffiliateSettings?: () => void;
 * }} props
 */
export function ProductEditManageSection({
  product,
  onSetAvailability,
  onSetAuction,
  onSetQa,
  onSetWholesale,
  onSetAffiliate,
  onDelete,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isQaTogglePending = false,
  isWholesaleTogglePending = false,
  isAffiliateTogglePending = false,
  isInstallmentTogglePending = false,
  isDeletePending = false,
  errorMessage = "",
  canEdit = true,
  canDelete = false,
  canToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  disabled = false,
  onOpenInstallmentProgram,
  onSetInstallment,
  canOpenInstallmentProgram = true,
  onOpenWholesaleSettings,
  onOpenAffiliateSettings,
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showAuctionToggle = typeof onSetAuction === "function" && canEdit;
  const isAuctionEnabled = product.productAuctionEnabled === true;
  const showQaToggle = typeof onSetQa === "function" && canEdit;
  const isQaEnabled = product.productQaEnabled === true;
  const isInstallmentEnabled = product.productInstallmentEnabled === true;
  const isWholesaleEnabled = product.productWholesaleEnabled === true;
  const affiliateOffer = resolveProductAffiliateOffer(product);
  const isAffiliateEnabled = affiliateOffer.enabled;
  const affiliateConfigured = isProductAffiliateConfigured(product);
  const wholesaleConfigured = isProductWholesaleConfigured(product);
  const showRaffleToggle =
    sellerRaffleActive && typeof onToggleRaffleParticipation === "function";
  const showInstallmentButton =
    typeof onOpenInstallmentProgram === "function" ||
    typeof onSetInstallment === "function";
  const showWholesale =
    typeof onOpenWholesaleSettings === "function" ||
    typeof onSetWholesale === "function";
  const showAffiliate =
    typeof onOpenAffiliateSettings === "function" ||
    typeof onSetAffiliate === "function";
  const showDelete = canDelete && typeof onDelete === "function";
  const isRaffleParticipant = isProductRaffleParticipant(product);
  const canOpenInstallment =
    canOpenInstallmentProgram &&
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
      PRODUCT_MODERATION_APPROVED;
  const showOpenSalesHint =
    hasOpenSalesLocked && (showAuctionToggle || showVisibility || showDelete);

  const actionsLocked =
    disabled ||
    isAvailabilityTogglePending ||
    isAuctionTogglePending ||
    isQaTogglePending ||
    isWholesaleTogglePending ||
    isAffiliateTogglePending ||
    isInstallmentTogglePending ||
    isRaffleParticipationPending ||
    isDeletePending ||
    isDeleteConfirmOpen ||
    !canEdit;

  const auctionActionsLocked = actionsLocked || hasOpenSalesLocked;
  const visibilityActionsLocked = actionsLocked || hasOpenSalesLocked;

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [product._id, onDelete]);

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
        {showQaToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_QA_TITLE}
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_QA_HINT}
            checked={isQaEnabled}
            disabled={actionsLocked}
            pending={isQaTogglePending}
            pendingLabel={CREATE_PRODUCT_MODAL_UI.QA_TOGGLE_PENDING}
            onCheckedChange={() => {
              if (product._id == null || actionsLocked) {
                return;
              }
              void onSetQa(String(product._id), !isQaEnabled);
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
              isWholesaleTogglePending ||
              isAffiliateTogglePending ||
              isDeletePending ||
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
              isWholesaleTogglePending ||
              isAffiliateTogglePending ||
              isInstallmentTogglePending ||
              isRaffleParticipationPending ||
              isDeletePending ||
              !canOpenInstallment
            }
            pending={isInstallmentTogglePending}
            pendingLabel={CREATE_PRODUCT_MODAL_UI.INSTALLMENT_TOGGLE_PENDING}
            variant="installment"
            onPress={() => onOpenInstallmentProgram?.()}
            onCheckedChange={async (next) => {
              if (product._id == null || !canOpenInstallment) {
                return { revert: true };
              }
              if (typeof onSetInstallment !== "function") {
                onOpenInstallmentProgram?.();
                return { revert: true };
              }
              const result = await onSetInstallment(String(product._id), next);
              if (result?.needsSetup) {
                onOpenInstallmentProgram?.();
                return { needsSetup: true };
              }
              return result;
            }}
          />
        ) : null}
        {showWholesale ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_WHOLESALE_TITLE}
            description={CREATE_PRODUCT_MODAL_UI.MANAGE_WHOLESALE_HINT}
            checked={isWholesaleEnabled}
            disabled={actionsLocked}
            pending={isWholesaleTogglePending}
            pendingLabel={CREATE_PRODUCT_MODAL_UI.WHOLESALE_TOGGLE_PENDING}
            onPress={() => onOpenWholesaleSettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return { revert: true };
              }
              if (next && !wholesaleConfigured) {
                onOpenWholesaleSettings?.();
                return { revert: true };
              }
              if (typeof onSetWholesale === "function") {
                void onSetWholesale(String(product._id), next);
              }
              return undefined;
            }}
          />
        ) : null}
        {showAffiliate && canEdit ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_MODAL_UI.MANAGE_AFFILIATE_TITLE}
            description={
              isAffiliateEnabled
                ? CREATE_PRODUCT_MODAL_UI.MANAGE_AFFILIATE_HINT_ON(affiliateOffer.percent)
                : CREATE_PRODUCT_MODAL_UI.MANAGE_AFFILIATE_HINT
            }
            checked={isAffiliateEnabled}
            disabled={actionsLocked}
            pending={isAffiliateTogglePending}
            pendingLabel={CREATE_PRODUCT_MODAL_UI.AFFILIATE_TOGGLE_PENDING}
            onPress={() => onOpenAffiliateSettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return { revert: true };
              }
              if (next && !affiliateConfigured) {
                onOpenAffiliateSettings?.();
                return { revert: true };
              }
              if (typeof onSetAffiliate === "function") {
                void onSetAffiliate(String(product._id), next, product);
              }
              return undefined;
            }}
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
      {showDelete ? (
        <div className="product-edit-manage__delete">
          {isDeletePending ? (
            <p className="product-edit-manage__delete-pending" aria-live="polite">
              {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
            </p>
          ) : isDeleteConfirmOpen ? (
            <div className="product-edit-manage__delete-confirm" role="group">
              <p className="product-edit-manage__delete-confirm-question">
                {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
              </p>
              <div className="product-edit-manage__delete-confirm-actions">
                <button
                  type="button"
                  className="product-edit-manage__delete-confirm-yes"
                  onClick={() => {
                    if (product._id == null) {
                      return;
                    }
                    setIsDeleteConfirmOpen(false);
                    void onDelete(String(product._id));
                  }}
                >
                  {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
                </button>
                <button
                  type="button"
                  className="product-edit-manage__delete-confirm-cancel"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="product-edit-manage__delete-btn"
              disabled={disabled || hasOpenSalesLocked}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <span className="product-edit-manage__delete-btn-title">
                {CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_TITLE}
              </span>
              <span className="product-edit-manage__delete-btn-hint">
                {CREATE_PRODUCT_MODAL_UI.MANAGE_DELETE_HINT}
              </span>
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
