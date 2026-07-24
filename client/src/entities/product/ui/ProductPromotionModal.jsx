import { useEffect, useMemo, useState } from "react";

import { PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { InstallmentProgramModal } from "../../installment/ui/InstallmentProgramModal.jsx";
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
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   manageErrorMessage?: string;
 *   canManageEdit?: boolean;
 *   canManageToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import("../model/types.js").ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
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
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  manageErrorMessage = "",
  canManageEdit = true,
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
      typeof onSetProductAuction === "function");
  const { activeTabId, setActiveTabId, isPromotionTab } = useProductPromotionModalTab({
    isOpen,
    showManageTab: showManageSection,
  });
  const [isInstallmentProgramOpen, setIsInstallmentProgramOpen] = useState(false);
  const defaultTier = tiers[0]?.tier ?? 1;
  const defaultDuration = durations[0]?.code ?? "";
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [selectedDurationCode, setSelectedDurationCode] = useState(defaultDuration);

  useEffect(() => {
    setSelectedTier(defaultTier);
    setSelectedDurationCode(defaultDuration);
    if (!isOpen) {
      setIsInstallmentProgramOpen(false);
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
            isAvailabilityTogglePending={isAvailabilityTogglePending}
            isAuctionTogglePending={isAuctionTogglePending}
            errorMessage={manageErrorMessage}
            canEdit={canManageEdit}
            canToggleVisibility={canManageToggleVisibility}
            sellerRaffleActive={sellerRaffleActive}
            onToggleRaffleParticipation={onToggleRaffleParticipation}
            isRaffleParticipationPending={isRaffleParticipationPending}
            isSubmitting={isSubmitting}
            onOpenInstallmentProgram={() => setIsInstallmentProgramOpen(true)}
          />
        )}
      </ProductModalShell>
      {product?._id != null ? (
        <InstallmentProgramModal
          isOpen={isInstallmentProgramOpen}
          productId={String(product._id)}
          productName={product.productName}
          onClose={() => setIsInstallmentProgramOpen(false)}
        />
      ) : null}
    </>
  );
}
