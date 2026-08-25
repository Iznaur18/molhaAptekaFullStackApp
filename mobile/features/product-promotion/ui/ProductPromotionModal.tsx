import { semanticColors } from "@/shared/theme/semanticColors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  calculateProductPromotionPointsCost,
  formatProductPromotionTierRatePercent,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "@/entities/product/lib/calculateProductPromotionPointsCost";
import {
  getProductPromotionTierChrome,
  resolveProductPromotionDurationChipStyle,
  resolveProductPromotionTierCardStyle,
} from "@/entities/product/lib/productPromotionTierChrome";
import type {
  ProductPromotionDuration,
  ProductPromotionTier,
} from "@/entities/product/api/fetchProductPromotionTariffs";
import { useProductPromotionModalTab } from "@/features/product-promotion/model/useProductPromotionModalTab";
import { ProductPromotionManageTab } from "@/features/product-promotion/ui/ProductPromotionManageTab";
import { InstallmentProgramModal } from "@/entities/installment/ui/InstallmentProgramModal";
import { WholesalePriceModal } from "@/entities/product/ui/WholesalePriceModal";
import { ProductRentalManageModal } from "@/entities/product/ui/ProductRentalManageModal";
import { ProductFlashSaleModal } from "@/entities/product/ui/ProductFlashSaleModal";
import { AffiliatePercentModal } from "@/entities/product/ui/AffiliatePercentModal";
import { ProductLoyaltyPointsModal } from "@/entities/product/ui/ProductLoyaltyPointsModal";
import { ProductBuyNFreeModal } from "@/entities/product/ui/ProductBuyNFreeModal";
import { ProductOutOfStockLabelModal } from "@/entities/product/ui/ProductOutOfStockLabelModal";
import { ProductPromotionModalTabs } from "@/features/product-promotion/ui/ProductPromotionModalTabs";
import { PRODUCT_CARD_UI, PRODUCT_PROMOTION_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductPromotionModalStyles } from "@/shared/theme/modalChromeStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const TIER_BADGE_LABELS: Record<number, string> = {
  [PRODUCT_PROMOTION_TIER_GOLD]: PRODUCT_CARD_UI.PROMOTED_BADGE,
  [PRODUCT_PROMOTION_TIER_TOP]: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
  [PRODUCT_PROMOTION_TIER_BANNER]: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
};

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductPromotionModalProps = {
  visible: boolean;
  product?: CatalogProduct | null;
  productName?: string;
  productPrice?: number;
  tiers: ProductPromotionTier[];
  durations: ProductPromotionDuration[];
  loyaltyPoints: number;
  isTariffsLoading?: boolean;
  tariffsError?: Error | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onRetryTariffs?: () => void;
  onClose: () => void;
  onSubmit: (tier: number, tariffCode: string) => void | Promise<void>;
  onSetProductAvailability?: (
    productId: string,
    productIsAvailable: boolean,
  ) => void | Promise<void>;
  onSetProductAuction?: (
    productId: string,
    productAuctionEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductOriginality?: (
    productId: string,
    productIsOriginal: boolean,
  ) => void | Promise<void>;
  onSetProductOutOfStock?: (
    productId: string,
    productOutOfStock: boolean,
  ) => void | Promise<void>;
  onSetProductWholesale?: (
    productId: string,
    productWholesaleEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductBuyNFree?: (
    productId: string,
    productBuyNFreeEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductRental?: (
    productId: string,
    productRentalEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductFlashSale?: (
    productId: string,
    productFlashSaleEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductAffiliate?: (
    productId: string,
    affiliateEnabled: boolean,
  ) => void | Promise<void>;
  onSetProductLoyaltyPoints?: (
    productId: string,
    loyaltyPointsPerUnit: number,
  ) => void | Promise<void>;
  onSetProductInstallment?: (
    productId: string,
    productInstallmentEnabled: boolean,
  ) => void | Promise<void | { needsSetup?: boolean }>;
  onWholesaleSaved?: (product: CatalogProduct) => void;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  isOriginalityTogglePending?: boolean;
  isOutOfStockTogglePending?: boolean;
  isWholesaleTogglePending?: boolean;
  isBuyNFreeTogglePending?: boolean;
  isRentalTogglePending?: boolean;
  isFlashSaleTogglePending?: boolean;
  isQaTogglePending?: boolean;
  onSetProductQa?: (
    productId: string,
    productQaEnabled: boolean,
  ) => void | Promise<void>;
  isAffiliateTogglePending?: boolean;
  isLoyaltyTogglePending?: boolean;
  isInstallmentTogglePending?: boolean;
  isDeletePending?: boolean;
  manageErrorMessage?: string;
  canManageEdit?: boolean;
  canManageDelete?: boolean;
  canManageToggleVisibility?: boolean;
  sellerRaffleActive?: boolean;
  onToggleRaffleParticipation?: (product: CatalogProduct, enabled: boolean) => void;
  isRaffleParticipationPending?: boolean;
  onDeleteProduct?: (productId: string) => void | Promise<void>;
  onInstallmentProgramSaved?: (productPatch?: Record<string, unknown>) => void;
};

export const ProductPromotionModal = ({
  visible,
  product = null,
  productName = "",
  productPrice = 0,
  tiers,
  durations,
  loyaltyPoints,
  isTariffsLoading = false,
  tariffsError = null,
  isSubmitting = false,
  errorMessage = "",
  onRetryTariffs,
  onClose,
  onSubmit,
  onSetProductAvailability,
  onSetProductAuction,
  onSetProductOriginality,
  onSetProductOutOfStock,
  onSetProductWholesale,
  onSetProductBuyNFree,
  onSetProductRental,
  onSetProductFlashSale,
  onSetProductQa,
  onSetProductAffiliate,
  onSetProductLoyaltyPoints,
  onSetProductInstallment,
  onWholesaleSaved,
  onDeleteProduct,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isOriginalityTogglePending = false,
  isOutOfStockTogglePending = false,
  isWholesaleTogglePending = false,
  isBuyNFreeTogglePending = false,
  isRentalTogglePending = false,
  isFlashSaleTogglePending = false,
  isQaTogglePending = false,
  isAffiliateTogglePending = false,
  isLoyaltyTogglePending = false,
  isInstallmentTogglePending = false,
  isDeletePending = false,
  manageErrorMessage = "",
  canManageEdit = true,
  canManageDelete = false,
  canManageToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  onInstallmentProgramSaved,
}: ProductPromotionModalProps) => {
  const styles = useProductPromotionModalStyles();
  const theme = useAppTheme();
  const resolvedProductName = String(product?.productName ?? productName).trim() || "Без названия";
  const resolvedProductPrice =
    product?.productPrice != null ? Number(product.productPrice) || 0 : productPrice;
  const showManageSection =
    product != null &&
    (typeof onSetProductAvailability === "function" ||
      typeof onSetProductAuction === "function" ||
      typeof onSetProductOriginality === "function" ||
      typeof onSetProductOutOfStock === "function" ||
      typeof onDeleteProduct === "function");
  const { activeTabId, setActiveTabId, isPromotionTab } = useProductPromotionModalTab({
    visible,
    showManageTab: showManageSection,
  });

  const defaultTier = tiers[0]?.tier ?? PRODUCT_PROMOTION_TIER_GOLD;
  const defaultDuration = durations[0]?.code ?? "";
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [selectedDurationCode, setSelectedDurationCode] = useState(defaultDuration);
  const [isInstallmentProgramOpen, setIsInstallmentProgramOpen] = useState(false);
  const [isWholesaleOpen, setIsWholesaleOpen] = useState(false);
  const [isBuyNFreeOpen, setIsBuyNFreeOpen] = useState(false);
  const [isOutOfStockLabelOpen, setIsOutOfStockLabelOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isFlashSaleOpen, setIsFlashSaleOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const bodyScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) {
      setIsInstallmentProgramOpen(false);
      setIsWholesaleOpen(false);
      setIsBuyNFreeOpen(false);
      setIsOutOfStockLabelOpen(false);
      setIsRentalOpen(false);
      setIsFlashSaleOpen(false);
      setIsAffiliateOpen(false);
      setIsLoyaltyOpen(false);
      return;
    }
    setSelectedTier(defaultTier);
    setSelectedDurationCode(defaultDuration);
  }, [defaultDuration, defaultTier, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    bodyScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTabId, visible]);

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

  const handleSubmit = () => {
    if (!selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0) {
      return;
    }
    void onSubmit(selectedTier, selectedDuration.code);
  };

  const renderPromotionBody = () => {
    if (isTariffsLoading) {
      return <ScreenLoadingState message={PRODUCT_PROMOTION_UI.LOADING_TARIFFS} />;
    }

    if (tariffsError) {
      return (
        <ScreenErrorState
          message={tariffsError.message}
          onRetry={onRetryTariffs}
        />
      );
    }

    return (
      <>
        <View
          style={[
            styles.overviewCard,
            hasEnoughFunds ? styles.overviewCardOk : styles.overviewCardInsufficient,
          ]}
        >
          <View>
            <Text style={styles.overviewProductLabel}>{PRODUCT_PROMOTION_UI.PRODUCT_LABEL}</Text>
            <Text style={styles.overviewProductName} numberOfLines={2}>
              {resolvedProductName}
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewBalanceRow}>
            <Text style={styles.balanceLabel}>{PRODUCT_PROMOTION_UI.BALANCE_LABEL}</Text>
            <Text style={styles.balanceValue}>
              {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
            </Text>
          </View>
          <Text style={styles.hint}>{PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS}</Text>
          <Text style={styles.hint}>{PRODUCT_PROMOTION_UI.REGION_BOOST_HINT}</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>{PRODUCT_PROMOTION_UI.TIER_LABEL}</Text>
          <View style={styles.tierGrid}>
            {tiers.map((tier) => {
              const isSelected = selectedTier === tier.tier;
              const ratePercent = formatProductPromotionTierRatePercent(tier.tier);
              const tierStyle = resolveProductPromotionTierCardStyle(tier.tier, isSelected);
              const chrome = getProductPromotionTierChrome(tier.tier);
              return (
                <Pressable
                  key={tier.tier}
                  style={[styles.tierCard, tierStyle.card]}
                  disabled={isSubmitting}
                  onPress={() => setSelectedTier(tier.tier)}
                >
                  {isSelected ? (
                    <View style={[styles.tierCheck, { backgroundColor: chrome.accent }]}>
                      <MaterialIcons name="check" size={14} color={theme.colors.onContrast} />
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.tierBadge,
                      { backgroundColor: tierStyle.badge.backgroundColor },
                      tierStyle.badgeText,
                    ]}
                  >
                    {TIER_BADGE_LABELS[tier.tier] ?? tier.title}
                  </Text>
                  {ratePercent ? (
                    <Text style={styles.tierRate}>
                      {PRODUCT_PROMOTION_UI.TIER_RATE_HINT(ratePercent)}
                    </Text>
                  ) : null}
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.sectionTitle}>{PRODUCT_PROMOTION_UI.DURATION_LABEL}</Text>
          <View style={styles.durationRow}>
            {durations.map((duration) => {
              const pricePoints = calculateProductPromotionPointsCost({
                productPrice: resolvedProductPrice,
                tier: selectedTier,
                durationCode: duration.code,
              });
              const isSelected = selectedDurationCode === duration.code;
              const durationStyle = resolveProductPromotionDurationChipStyle(
                isSelected,
                selectedTier,
              );
              return (
                <Pressable
                  key={duration.code}
                  style={[styles.durationChip, durationStyle.chip]}
                  disabled={isSubmitting}
                  onPress={() => setSelectedDurationCode(duration.code)}
                >
                  <Text style={styles.durationTitle}>{duration.title}</Text>
                  <Text style={[styles.durationPrice, durationStyle.price]}>
                    {PRODUCT_PROMOTION_UI.DURATION_PRICE_POINTS(pricePoints)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedDuration && selectedTierMeta ? (
            <>
              <View style={styles.planDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{PRODUCT_PROMOTION_UI.SUMMARY_TIER}</Text>
                <Text style={styles.summaryValueStrong}>{selectedTierMeta.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{PRODUCT_PROMOTION_UI.SUMMARY_DURATION}</Text>
                <Text style={styles.summaryValueStrong}>
                  {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedDuration.durationHours)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryValueBold}>{PRODUCT_PROMOTION_UI.TOTAL_LABEL}</Text>
                <Text
                  style={[
                    styles.summaryTotalValue,
                    selectedTier === PRODUCT_PROMOTION_TIER_BANNER && {
                      color: semanticColors.danger,
                    },
                  ]}
                >
                  {PRODUCT_PROMOTION_UI.TOTAL_POINTS(selectedPricePoints)}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {insufficientMessage ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.error}>{insufficientMessage}</Text>
          </View>
        ) : null}
        {errorMessage ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.error}>{errorMessage}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderBody = () => {
    if (isPromotionTab) {
      return renderPromotionBody();
    }

    if (product == null || !showManageSection) {
      return null;
    }

    return (
      <ProductPromotionManageTab
        product={product}
        onSetAvailability={onSetProductAvailability}
        onSetAuction={onSetProductAuction}
        onSetOriginality={onSetProductOriginality}
        onSetOutOfStock={onSetProductOutOfStock}
        onSetWholesale={onSetProductWholesale}
        onSetBuyNFree={onSetProductBuyNFree}
        onSetRental={onSetProductRental}
        onSetFlashSale={onSetProductFlashSale}
        onSetQa={onSetProductQa}
        onSetAffiliate={onSetProductAffiliate}
        onSetLoyaltyPoints={onSetProductLoyaltyPoints}
        onSetInstallment={onSetProductInstallment}
        onDelete={onDeleteProduct}
        isAvailabilityTogglePending={isAvailabilityTogglePending}
        isAuctionTogglePending={isAuctionTogglePending}
        isOriginalityTogglePending={isOriginalityTogglePending}
        isOutOfStockTogglePending={isOutOfStockTogglePending}
        isWholesaleTogglePending={isWholesaleTogglePending}
        isBuyNFreeTogglePending={isBuyNFreeTogglePending}
        isRentalTogglePending={isRentalTogglePending}
        isFlashSaleTogglePending={isFlashSaleTogglePending}
        isQaTogglePending={isQaTogglePending}
        isAffiliateTogglePending={isAffiliateTogglePending}
        isLoyaltyTogglePending={isLoyaltyTogglePending}
        isInstallmentTogglePending={isInstallmentTogglePending}
        isDeletePending={isDeletePending}
        errorMessage={manageErrorMessage}
        canEdit={canManageEdit}
        canDelete={canManageDelete}
        canToggleVisibility={canManageToggleVisibility}
        sellerRaffleActive={sellerRaffleActive}
        onToggleRaffleParticipation={onToggleRaffleParticipation}
        isRaffleParticipationPending={isRaffleParticipationPending}
        onOpenInstallmentProgram={() => setIsInstallmentProgramOpen(true)}
        onOpenWholesaleSettings={() => setIsWholesaleOpen(true)}
        onOpenBuyNFreeSettings={() => setIsBuyNFreeOpen(true)}
        onOpenOutOfStockSettings={() => setIsOutOfStockLabelOpen(true)}
        onOpenRentalSettings={() => setIsRentalOpen(true)}
        onOpenFlashSaleSettings={() => setIsFlashSaleOpen(true)}
        onOpenAffiliateSettings={() => setIsAffiliateOpen(true)}
        onOpenLoyaltySettings={() => setIsLoyaltyOpen(true)}
        isSubmitting={isSubmitting}
      />
    );
  };

  return (
    <>
      <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.card} pointerEvents="auto">
          <View style={styles.headerRow}>
            <Text style={styles.title}>{PRODUCT_PROMOTION_UI.MODAL_TITLE}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PRODUCT_PROMOTION_UI.CLOSE}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.closeCircleButton,
                pressed && styles.closeCircleButtonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {showManageSection ? (
            <View style={styles.headerAddon}>
              <ProductPromotionModalTabs
                activeTabId={activeTabId}
                onTabChange={(tabId) => setActiveTabId(tabId as typeof activeTabId)}
                showManageTab={showManageSection}
              />
            </View>
          ) : null}

          {isPromotionTab ? (
            <ScrollView
              ref={bodyScrollRef}
              style={styles.bodyScroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {renderBody()}
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {renderBody()}
            </ScrollView>
          )}

          {isPromotionTab ? (
            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  pressed && styles.buttonPressed,
                  (isTariffsLoading ||
                    Boolean(tariffsError) ||
                    !selectedDuration ||
                    isSubmitting ||
                    !hasEnoughFunds ||
                    tiers.length === 0) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  isTariffsLoading ||
                  Boolean(tariffsError) ||
                  !selectedDuration ||
                  isSubmitting ||
                  !hasEnoughFunds ||
                  tiers.length === 0
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.onContrast} />
                ) : (
                  <Text style={styles.primaryButtonText}>{PRODUCT_PROMOTION_UI.SUBMIT_POINTS}</Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </View>
        {isInstallmentProgramOpen && product?._id != null ? (
          <InstallmentProgramModal
            embedded
            visible
            productId={String(product._id)}
            productName={resolvedProductName}
            productPrice={resolvedProductPrice}
            onClose={() => setIsInstallmentProgramOpen(false)}
            onSaved={onInstallmentProgramSaved}
          />
        ) : null}
        {isWholesaleOpen ? (
          <WholesalePriceModal
            embedded
            visible
            product={product}
            onClose={() => setIsWholesaleOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isBuyNFreeOpen ? (
          <ProductBuyNFreeModal
            embedded
            visible
            product={product}
            onClose={() => setIsBuyNFreeOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isOutOfStockLabelOpen ? (
          <ProductOutOfStockLabelModal
            embedded
            visible
            product={product}
            onClose={() => setIsOutOfStockLabelOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isRentalOpen ? (
          <ProductRentalManageModal
            embedded
            visible
            product={product}
            onClose={() => setIsRentalOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isFlashSaleOpen ? (
          <ProductFlashSaleModal
            embedded
            visible
            product={product}
            onClose={() => setIsFlashSaleOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isAffiliateOpen ? (
          <AffiliatePercentModal
            embedded
            visible
            product={product}
            onClose={() => setIsAffiliateOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
        {isLoyaltyOpen ? (
          <ProductLoyaltyPointsModal
            embedded
            visible
            product={product}
            onClose={() => setIsLoyaltyOpen(false)}
            onSaved={onWholesaleSaved}
          />
        ) : null}
      </View>
    </Modal>
    </>
  );
};
