import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { ProductEditManageSection } from "./ProductEditManageSection.jsx";

import "./ProductPromotionManageSection.css";

/**
 * @typedef {Object} ProductPromotionManageSectionProps
 * @property {import("../model/types.js").ProductFromApi} product
 * @property {(productId: string, productIsAvailable: boolean) => void | Promise<void>} [onSetAvailability]
 * @property {(productId: string, productAuctionEnabled: boolean) => void | Promise<void>} [onSetAuction]
 * @property {(productId: string, productQaEnabled: boolean) => void | Promise<void>} [onSetQa]
 * @property {(productId: string, productIsOriginal: boolean) => void | Promise<void>} [onSetOriginality]
 * @property {boolean} [isAvailabilityTogglePending]
 * @property {boolean} [isAuctionTogglePending]
 * @property {boolean} [isQaTogglePending]
 * @property {boolean} [isOriginalityTogglePending]
 * @property {string} [errorMessage]
 * @property {boolean} [canEdit]
 * @property {boolean} [canToggleVisibility]
 * @property {(productId: string) => void | Promise<void>} [onDelete]
 * @property {boolean} [isDeletePending]
 * @property {boolean} [canDelete]
 * @property {boolean} [sellerRaffleActive]
 * @property {(product: import("../model/types.js").ProductFromApi, enabled: boolean) => void} [onToggleRaffleParticipation]
 * @property {boolean} [isRaffleParticipationPending]
 * @property {boolean} [isSubmitting]
 * @property {() => void} [onOpenInstallmentProgram]
 * @property {boolean} [embeddedInTab]
 */

/**
 * @param {ProductPromotionManageSectionProps} props
 */
export function ProductPromotionManageSection({
  product,
  onSetAvailability,
  onSetAuction,
  onSetQa,
  onSetOriginality,
  onSetWholesale,
  onSetRental,
  onSetAffiliate,
  onSetInstallment,
  onDelete,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isQaTogglePending = false,
  isOriginalityTogglePending = false,
  isWholesaleTogglePending = false,
  isRentalTogglePending = false,
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
  isSubmitting = false,
  onOpenInstallmentProgram,
  onOpenWholesaleSettings,
  onOpenRentalSettings,
  onOpenAffiliateSettings,
  onOpenPromoCodesSettings,
  embeddedInTab = false,
}) {
  const sectionClassName = [
    "product-promotion-manage",
    embeddedInTab ? "product-promotion-manage--embedded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={sectionClassName}
      aria-labelledby={embeddedInTab ? undefined : "product-promotion-manage-title"}
    >
      {embeddedInTab ? null : (
        <>
          <h3 id="product-promotion-manage-title" className="product-promotion-manage__title">
            {CREATE_PRODUCT_MODAL_UI.MANAGE_SECTION_TITLE}
          </h3>
          <p className="product-promotion-manage__lead">
            {CREATE_PRODUCT_MODAL_UI.EDIT_WIZARD_STEP_MANAGE_SUBTITLE}
          </p>
        </>
      )}
      <ProductEditManageSection
        product={product}
        onSetAvailability={onSetAvailability}
        onSetAuction={onSetAuction}
        onSetQa={onSetQa}
        onSetOriginality={onSetOriginality}
        onSetWholesale={onSetWholesale}
        onSetRental={onSetRental}
        onSetAffiliate={onSetAffiliate}
        onSetInstallment={onSetInstallment}
        onDelete={onDelete}
        isAvailabilityTogglePending={isAvailabilityTogglePending}
        isAuctionTogglePending={isAuctionTogglePending}
        isQaTogglePending={isQaTogglePending}
        isOriginalityTogglePending={isOriginalityTogglePending}
        isWholesaleTogglePending={isWholesaleTogglePending}
        isRentalTogglePending={isRentalTogglePending}
        isAffiliateTogglePending={isAffiliateTogglePending}
        isInstallmentTogglePending={isInstallmentTogglePending}
        isDeletePending={isDeletePending}
        errorMessage={errorMessage}
        canEdit={canEdit}
        canDelete={canDelete}
        canToggleVisibility={canToggleVisibility}
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={onToggleRaffleParticipation}
        isRaffleParticipationPending={isRaffleParticipationPending}
        disabled={isSubmitting}
        onOpenInstallmentProgram={onOpenInstallmentProgram}
        onOpenWholesaleSettings={onOpenWholesaleSettings}
        onOpenRentalSettings={onOpenRentalSettings}
        onOpenAffiliateSettings={onOpenAffiliateSettings}
        onOpenPromoCodesSettings={onOpenPromoCodesSettings}
        canOpenInstallmentProgram={
          (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
          PRODUCT_MODERATION_APPROVED
        }
      />
    </section>
  );
}
