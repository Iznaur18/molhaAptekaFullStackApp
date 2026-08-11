import { useEffect, useMemo, useState } from "react";

import { PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { InstallmentProgramModal } from "../../installment/ui/InstallmentProgramModal.jsx";
import { WholesalePriceModal } from "./WholesalePriceModal.jsx";
import { ProductPromoCodesModal } from "./ProductPromoCodesModal.jsx";
import { ProductRentalManageModal } from "./ProductRentalManageModal.jsx";
import { AffiliatePercentModal } from "./AffiliatePercentModal.jsx";
import { calculateProductPromotionPointsCost } from "../lib/calculateProductPromotionPointsCost.js";
import { ProductPromotionFormPanel } from "./product-promotion-modal/ProductPromotionFormPanel.jsx";
import { ProductPromotionManageTab } from "./product-promotion-modal/ProductPromotionManageTab.jsx";
import { ProductPromotionModalTabs } from "./product-promotion-modal/ProductPromotionModalTabs.jsx";
import { useProductPromotionModalTab } from "./product-promotion-modal/useProductPromotionModalTab.js";

import "./ProductPromotionManageSection.css";
import "./ProductPromotionModal.css";

const PRODUCT_PROMOTION_MODAL_TITLE_ID = "product-promotion-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product?: import("../model/types.js").ProductFromApi | null;
 *   productName?: string;
 *   productPrice?: number;
 *   tiers: Array<{ tier: number; title: string; description: string }>;
 *   durations: Array<{ code: string; title: string; durationHours: number; durationMult: number }>;
 *   loyaltyPoints: number;
 *   isSubmitting?: boolean;
 *   errorMessage?: string;
 *   onClose: () => void;
 *   onSubmit: (tier: number, tariffCode: string) => void | Promise<void>;
 *   onSetProductAvailability?: (
 *     productId: string,
 *     productIsAvailable: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductAuction?: (
 *     productId: string,
 *     productAuctionEnabled: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductQa?: (
 *     productId: string,
 *     productQaEnabled: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductOriginality?: (
 *     productId: string,
 *     productIsOriginal: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductWholesale?: (
 *     productId: string,
 *     productWholesaleEnabled: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductRental?: (
 *     productId: string,
 *     productRentalEnabled: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductAffiliate?: (
 *     productId: string,
 *     affiliateEnabled: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductInstallment?: (
 *     productId: string,
 *     productInstallmentEnabled: boolean,
 *   ) => void | Promise<void | { needsSetup?: boolean }>;
 *   onWholesaleSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 *   onInstallmentProgramSaved?: (productPatch?: {
 *     productInstallmentEnabled?: boolean;
 *   }) => void;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   isQaTogglePending?: boolean;
 *   isOriginalityTogglePending?: boolean;
 *   isWholesaleTogglePending?: boolean;
 *   isRentalTogglePending?: boolean;
 *   isAffiliateTogglePending?: boolean;
 *   isInstallmentTogglePending?: boolean;
 *   isDeletePending?: boolean;
 *   manageErrorMessage?: string;
 *   canManageEdit?: boolean;
 *   canManageDelete?: boolean;
 *   canManageToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import("../model/types.js").ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
 *   onDeleteProduct?: (productId: string) => void | Promise<void>;
 * }} props
 */
export function ProductPromotionModal({
  isOpen,
  product = null,
  productName = "",
  productPrice = 0,
  tiers,
  durations,
  loyaltyPoints,
  isSubmitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
  onSetProductAvailability,
  onSetProductAuction,
  onSetProductQa,
  onSetProductOriginality,
  onSetProductWholesale,
  onSetProductRental,
  onSetProductAffiliate,
  onSetProductInstallment,
  onWholesaleSaved,
  onInstallmentProgramSaved,
  onDeleteProduct,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isQaTogglePending = false,
  isOriginalityTogglePending = false,
  isWholesaleTogglePending = false,
  isRentalTogglePending = false,
  isAffiliateTogglePending = false,
  isInstallmentTogglePending = false,
  isDeletePending = false,
  manageErrorMessage = "",
  canManageEdit = true,
  canManageDelete = false,
  canManageToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
}) {
  const resolvedProductName = product?.productName?.trim() || productName;
  const resolvedProductPrice =
    product?.productPrice != null ? Number(product.productPrice) || 0 : productPrice;
  const showManageSection =
    product != null &&
    (typeof onSetProductAvailability === "function" ||
      typeof onSetProductAuction === "function" ||
      typeof onSetProductOriginality === "function" ||
      typeof onDeleteProduct === "function");
  const { activeTabId, setActiveTabId, isPromotionTab } = useProductPromotionModalTab({
    isOpen,
    showManageTab: showManageSection,
  });
  const [isInstallmentProgramOpen, setIsInstallmentProgramOpen] = useState(false);
  const [isWholesaleOpen, setIsWholesaleOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isPromoCodesOpen, setIsPromoCodesOpen] = useState(false);
  const defaultTier = tiers[0]?.tier ?? 1;
  const defaultDuration = durations[0]?.code ?? "";
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [selectedDurationCode, setSelectedDurationCode] = useState(defaultDuration);

  useEffect(() => {
    setSelectedTier(defaultTier);
    setSelectedDurationCode(defaultDuration);
    if (!isOpen) {
      setIsInstallmentProgramOpen(false);
      setIsWholesaleOpen(false);
      setIsRentalOpen(false);
      setIsAffiliateOpen(false);
      setIsPromoCodesOpen(false);
    }
  }, [defaultDuration, defaultTier, isOpen]);

  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === selectedDurationCode) ?? null,
    [durations, selectedDurationCode],
  );

  const selectedTierMeta = useMemo(
    () => tiers.find((item) => item.tier === selectedTier) ?? null,
    [selectedTier, tiers],
  );

  const selectedPricePoints = useMemo(() => {
    if (!selectedDuration) {
      return 0;
    }
    return calculateProductPromotionPointsCost({
      productPrice: resolvedProductPrice,
      tier: selectedTier,
      durationCode: selectedDuration.code,
    });
  }, [resolvedProductPrice, selectedDuration, selectedTier]);

  const hasEnoughFunds = loyaltyPoints >= selectedPricePoints;

  const insufficientMessage =
    selectedDuration && !hasEnoughFunds
      ? PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(selectedPricePoints, loyaltyPoints)
      : "";

  const handleTierChange = (tier) => {
    if (isSubmitting || tiers.length === 0) {
      return;
    }
    setSelectedTier(tier);
  };

  const handleDurationChange = (code) => {
    if (isSubmitting || durations.length === 0) {
      return;
    }
    setSelectedDurationCode(code);
  };

  const handleSubmit = () => {
    if (!selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0) {
      return;
    }
    void onSubmit(selectedTier, selectedDuration.code);
  };

  const footer = isPromotionTab ? (
    <div className="product-promotion-modal__actions">
      <button
        type="button"
        className="app-btn app-btn--cancel"
        onClick={onClose}
        disabled={isSubmitting}
      >
        {PRODUCT_PROMOTION_UI.CANCEL}
      </button>
      <button
        type="button"
        className="app-btn app-btn--primary"
        disabled={
          !selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0
        }
        onClick={handleSubmit}
      >
        {isSubmitting
          ? PRODUCT_PROMOTION_UI.SUBMIT_PENDING
          : PRODUCT_PROMOTION_UI.SUBMIT_POINTS}
      </button>
    </div>
  ) : null;

  const headerAddon = showManageSection ? (
    <ProductPromotionModalTabs
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      showManageTab={showManageSection}
    />
  ) : null;

  return (
    <>
      <ProductModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={PRODUCT_PROMOTION_UI.MODAL_TITLE}
        titleId={PRODUCT_PROMOTION_MODAL_TITLE_ID}
        size="lg"
        panelClassName={`product-promotion-modal product-promotion-modal--tier-${selectedTier}`}
        bodyClassName="product-promotion-modal__body"
        footer={footer}
        footerClassName="product-promotion-modal__footer"
        headerAddon={headerAddon}
        hideTitle
      >
        {isPromotionTab ? (
          <ProductPromotionFormPanel
            productName={resolvedProductName}
            loyaltyPoints={loyaltyPoints}
            hasEnoughFunds={hasEnoughFunds}
            tiers={tiers}
            durations={durations}
            productPrice={resolvedProductPrice}
            selectedTier={selectedTier}
            selectedDurationCode={selectedDurationCode}
            selectedDuration={selectedDuration}
            selectedTierMeta={selectedTierMeta}
            selectedPricePoints={selectedPricePoints}
            insufficientMessage={insufficientMessage}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onTierChange={handleTierChange}
            onDurationChange={handleDurationChange}
          />
        ) : (
          <ProductPromotionManageTab
            product={product}
            onSetAvailability={onSetProductAvailability}
            onSetAuction={onSetProductAuction}
            onSetQa={onSetProductQa}
            onSetOriginality={onSetProductOriginality}
            onSetWholesale={onSetProductWholesale}
            onSetRental={onSetProductRental}
            onSetAffiliate={onSetProductAffiliate}
            onSetInstallment={onSetProductInstallment}
            onDelete={onDeleteProduct}
            isAvailabilityTogglePending={isAvailabilityTogglePending}
            isAuctionTogglePending={isAuctionTogglePending}
            isQaTogglePending={isQaTogglePending}
            isOriginalityTogglePending={isOriginalityTogglePending}
            isWholesaleTogglePending={isWholesaleTogglePending}
            isRentalTogglePending={isRentalTogglePending}
            isAffiliateTogglePending={isAffiliateTogglePending}
            isInstallmentTogglePending={isInstallmentTogglePending}
            isDeletePending={isDeletePending}
            errorMessage={manageErrorMessage}
            canEdit={canManageEdit}
            canDelete={canManageDelete}
            canToggleVisibility={canManageToggleVisibility}
            sellerRaffleActive={sellerRaffleActive}
            onToggleRaffleParticipation={onToggleRaffleParticipation}
            isRaffleParticipationPending={isRaffleParticipationPending}
            isSubmitting={isSubmitting}
            onOpenInstallmentProgram={() => setIsInstallmentProgramOpen(true)}
            onOpenWholesaleSettings={() => setIsWholesaleOpen(true)}
            onOpenRentalSettings={() => setIsRentalOpen(true)}
            onOpenAffiliateSettings={() => setIsAffiliateOpen(true)}
            onOpenPromoCodesSettings={() => setIsPromoCodesOpen(true)}
          />
        )}
      </ProductModalShell>
      {product?._id != null ? (
        <InstallmentProgramModal
          isOpen={isInstallmentProgramOpen}
          productId={String(product._id)}
          productName={product.productName}
          productPrice={
            product.productPrice != null ? Number(product.productPrice) || 0 : 0
          }
          onClose={() => setIsInstallmentProgramOpen(false)}
          onSaved={onInstallmentProgramSaved}
        />
      ) : null}
      <WholesalePriceModal
        isOpen={isWholesaleOpen}
        product={product}
        onClose={() => setIsWholesaleOpen(false)}
        onSaved={onWholesaleSaved}
      />
      <ProductRentalManageModal
        isOpen={isRentalOpen}
        product={product}
        onClose={() => setIsRentalOpen(false)}
        onSaved={onWholesaleSaved}
      />
      <AffiliatePercentModal
        isOpen={isAffiliateOpen}
        product={product}
        onClose={() => setIsAffiliateOpen(false)}
        onSaved={onWholesaleSaved}
      />
      <ProductPromoCodesModal
        isOpen={isPromoCodesOpen}
        product={product}
        onClose={() => setIsPromoCodesOpen(false)}
        onSaved={(payload) => {
          if (product && typeof onWholesaleSaved === "function") {
            onWholesaleSaved({
              ...product,
              productHasActivePromoCodes: payload.productHasActivePromoCodes,
            });
          }
        }}
      />
    </>
  );
}
