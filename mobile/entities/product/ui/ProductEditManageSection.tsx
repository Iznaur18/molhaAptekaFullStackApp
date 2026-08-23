import {
  isProductAffiliateConfigured,
  isProductBuyNFreeConfigured,
  isProductWholesaleConfigured,
  isProductRentalConfigured,
} from "@izibuy/shared-lib";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { ProductManageToggleRow } from "@/entities/product/ui/ProductManageToggleRow";
import { PRODUCT_MODERATION_APPROVED } from "@/entities/product/model/productModerationConstants";
import { CREATE_PRODUCT_UI, PRODUCT_CARD_UI } from "@/shared/config";
import { useProductEditManageSectionStyles } from "@/shared/theme/modalChromeStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductEditManageSectionProps = {
  product: CatalogProduct;
  onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
  onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
  onSetOriginality?: (productId: string, productIsOriginal: boolean) => void | Promise<void>;
  onSetOutOfStock?: (productId: string, productOutOfStock: boolean) => void | Promise<void>;
  onSetWholesale?: (productId: string, productWholesaleEnabled: boolean) => void | Promise<void>;
  onSetBuyNFree?: (productId: string, productBuyNFreeEnabled: boolean) => void | Promise<void>;
  onSetRental?: (productId: string, productRentalEnabled: boolean) => void | Promise<void>;
  onSetAffiliate?: (
    productId: string,
    affiliateEnabled: boolean,
    product?: CatalogProduct,
  ) => void | Promise<void>;
  onSetLoyaltyPoints?: (
    productId: string,
    loyaltyPointsPerUnit: number,
  ) => void | Promise<void>;
  onSetInstallment?: (
    productId: string,
    productInstallmentEnabled: boolean,
  ) => void | Promise<void | { needsSetup?: boolean }>;
  onDelete?: (productId: string) => void | Promise<void>;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  isOriginalityTogglePending?: boolean;
  isOutOfStockTogglePending?: boolean;
  isWholesaleTogglePending?: boolean;
  isBuyNFreeTogglePending?: boolean;
  isRentalTogglePending?: boolean;
  isAffiliateTogglePending?: boolean;
  isLoyaltyTogglePending?: boolean;
  isInstallmentTogglePending?: boolean;
  isDeletePending?: boolean;
  errorMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleVisibility?: boolean;
  sellerRaffleActive?: boolean;
  onToggleRaffleParticipation?: (product: CatalogProduct, enabled: boolean) => void;
  isRaffleParticipationPending?: boolean;
  onOpenInstallmentProgram?: () => void;
  canOpenInstallmentProgram?: boolean;
  onOpenWholesaleSettings?: () => void;
  onOpenBuyNFreeSettings?: () => void;
  onOpenRentalSettings?: () => void;
  onOpenAffiliateSettings?: () => void;
  onOpenLoyaltySettings?: () => void;
  onOpenOutOfStockSettings?: () => void;
  disabled?: boolean;
};

const resolveAffiliateEnabled = (product: CatalogProduct) => {
  const percent = Math.floor(Number(product.affiliatePercent) || 0);
  return product.affiliateEnabled === true && percent > 0;
};

const resolveAffiliatePercent = (product: CatalogProduct) =>
  Math.floor(Number(product.affiliatePercent) || 0);

export const ProductEditManageSection = ({
  product,
  onSetAvailability,
  onSetAuction,
  onSetOriginality,
  onSetOutOfStock,
  onSetWholesale,
  onSetBuyNFree,
  onSetRental,
  onSetAffiliate,
  onSetLoyaltyPoints,
  onSetInstallment,
  onDelete,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isOriginalityTogglePending = false,
  isOutOfStockTogglePending = false,
  isWholesaleTogglePending = false,
  isBuyNFreeTogglePending = false,
  isRentalTogglePending = false,
  isAffiliateTogglePending = false,
  isLoyaltyTogglePending = false,
  isInstallmentTogglePending = false,
  isDeletePending = false,
  errorMessage = "",
  canEdit = true,
  canDelete = false,
  canToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
  onOpenWholesaleSettings,
  onOpenBuyNFreeSettings,
  onOpenRentalSettings,
  onOpenAffiliateSettings,
  onOpenLoyaltySettings,
  onOpenOutOfStockSettings,
  disabled = false,
}: ProductEditManageSectionProps) => {
  const styles = useProductEditManageSectionStyles();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showAuctionToggle = typeof onSetAuction === "function" && canEdit;
  const isAuctionEnabled = product.productAuctionEnabled === true;
  const showOriginality = typeof onSetOriginality === "function" && canEdit;
  const isOriginal = product.productIsOriginal === true;
  const isOutOfStock = product.productOutOfStock === true;
  const showOutOfStockToggle = typeof onSetOutOfStock === "function" && canEdit;
  const isInstallmentEnabled = product.productInstallmentEnabled === true;
  const isWholesaleEnabled = product.productWholesaleEnabled === true;
  const isBuyNFreeEnabled = product.productBuyNFreeEnabled === true;
  const buyNFreeThreshold = Math.floor(Number(product.productBuyNFreeThreshold) || 0);
  const isRentalEnabled = product.productRentalEnabled === true;
  const isAffiliateEnabled = resolveAffiliateEnabled(product);
  const affiliatePercent = resolveAffiliatePercent(product);
  const loyaltyPointsPerUnit = resolveProductLoyaltyPointsPerUnit(product);
  const isLoyaltyEnabled = loyaltyPointsPerUnit > 0;
  const wholesaleConfigured = isProductWholesaleConfigured(
    product as Parameters<typeof isProductWholesaleConfigured>[0],
  );
  const buyNFreeConfigured = isProductBuyNFreeConfigured(
    product as Parameters<typeof isProductBuyNFreeConfigured>[0],
  );
  const rentalConfigured = isProductRentalConfigured(
    product as Parameters<typeof isProductRentalConfigured>[0],
  );
  const affiliateConfigured = isProductAffiliateConfigured(product);
  const showWholesale =
    typeof onOpenWholesaleSettings === "function" || typeof onSetWholesale === "function";
  const showBuyNFree =
    typeof onOpenBuyNFreeSettings === "function" || typeof onSetBuyNFree === "function";
  const showRental =
    typeof onOpenRentalSettings === "function" || typeof onSetRental === "function";
  const showAffiliate =
    typeof onOpenAffiliateSettings === "function" || typeof onSetAffiliate === "function";
  const showLoyalty =
    typeof onOpenLoyaltySettings === "function" || typeof onSetLoyaltyPoints === "function";
  const showRaffleToggle =
    sellerRaffleActive && typeof onToggleRaffleParticipation === "function";
  const showInstallmentButton =
    typeof onOpenInstallmentProgram === "function" || typeof onSetInstallment === "function";
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
    isOriginalityTogglePending ||
    isOutOfStockTogglePending ||
    isWholesaleTogglePending ||
    isBuyNFreeTogglePending ||
    isRentalTogglePending ||
    isAffiliateTogglePending ||
    isLoyaltyTogglePending ||
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
    <View
      style={styles.root}
      accessibilityLabel={CREATE_PRODUCT_UI.MANAGE_SECTION_ARIA}
    >
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
      {showOpenSalesHint ? (
        <View style={styles.warningBanner} accessibilityRole="alert">
          <MaterialIcons name="info-outline" size={20} color={semanticColors.warningText} />
          <Text style={styles.warningBannerText}>{PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}</Text>
        </View>
      ) : null}
      <View style={styles.toggles}>
        {showOriginality ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.LABEL_ORIGINALITY}
            description={CREATE_PRODUCT_UI.ORIGINALITY_STATEMENT}
            checked={isOriginal}
            disabled={actionsLocked}
            pending={isOriginalityTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.ORIGINALITY_TOGGLE_PENDING}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return;
              }
              void onSetOriginality(String(product._id), next);
            }}
          />
        ) : null}
        {showAuctionToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_AUCTION_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_AUCTION_HINT}
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
            title={CREATE_PRODUCT_UI.MANAGE_RAFFLE_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_RAFFLE_HINT}
            checked={isRaffleParticipant}
            disabled={
              isRaffleParticipationPending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              isWholesaleTogglePending ||
              isAffiliateTogglePending ||
              isLoyaltyTogglePending ||
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
            title={CREATE_PRODUCT_UI.MANAGE_INSTALLMENT_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_INSTALLMENT_HINT}
            checked={isInstallmentEnabled}
            disabled={
              disabled ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              isWholesaleTogglePending ||
              isAffiliateTogglePending ||
              isLoyaltyTogglePending ||
              isInstallmentTogglePending ||
              isRaffleParticipationPending ||
              isDeletePending ||
              !canOpenInstallment
            }
            pending={isInstallmentTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.INSTALLMENT_TOGGLE_PENDING}
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
            title={CREATE_PRODUCT_UI.MANAGE_WHOLESALE_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_WHOLESALE_HINT}
            checked={isWholesaleEnabled}
            disabled={actionsLocked}
            pending={isWholesaleTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.WHOLESALE_TOGGLE_PENDING}
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
        {showBuyNFree && canEdit ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_BUY_N_FREE_TITLE}
            description={
              isBuyNFreeEnabled && buyNFreeThreshold >= 2
                ? CREATE_PRODUCT_UI.MANAGE_BUY_N_FREE_HINT_ON(buyNFreeThreshold)
                : CREATE_PRODUCT_UI.MANAGE_BUY_N_FREE_HINT
            }
            checked={isBuyNFreeEnabled}
            disabled={actionsLocked}
            pending={isBuyNFreeTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.BUY_N_FREE_TOGGLE_PENDING}
            onPress={() => onOpenBuyNFreeSettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return { revert: true };
              }
              if (next && !buyNFreeConfigured) {
                onOpenBuyNFreeSettings?.();
                return { revert: true };
              }
              if (typeof onSetBuyNFree === "function") {
                void onSetBuyNFree(String(product._id), next);
              }
              return undefined;
            }}
          />
        ) : null}
        {showRental ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_RENTAL_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_RENTAL_HINT}
            checked={isRentalEnabled}
            disabled={actionsLocked}
            pending={isRentalTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.RENTAL_TOGGLE_PENDING}
            onPress={() => onOpenRentalSettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return { revert: true };
              }
              if (next && !rentalConfigured) {
                onOpenRentalSettings?.();
                return { revert: true };
              }
              if (typeof onSetRental === "function") {
                void onSetRental(String(product._id), next);
              }
              return undefined;
            }}
          />
        ) : null}
        {showLoyalty && canEdit ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_LOYALTY_TITLE}
            description={
              isLoyaltyEnabled
                ? CREATE_PRODUCT_UI.MANAGE_LOYALTY_HINT_ON(loyaltyPointsPerUnit)
                : CREATE_PRODUCT_UI.MANAGE_LOYALTY_HINT
            }
            checked={isLoyaltyEnabled}
            disabled={actionsLocked}
            pending={isLoyaltyTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.LOYALTY_TOGGLE_PENDING}
            onPress={() => onOpenLoyaltySettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return { revert: true };
              }
              if (next) {
                onOpenLoyaltySettings?.();
                return { revert: true };
              }
              if (typeof onSetLoyaltyPoints === "function") {
                void onSetLoyaltyPoints(String(product._id), 0);
              }
              return undefined;
            }}
          />
        ) : null}
        {showAffiliate && canEdit ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_AFFILIATE_TITLE}
            description={
              isAffiliateEnabled
                ? CREATE_PRODUCT_UI.MANAGE_AFFILIATE_HINT_ON(affiliatePercent)
                : CREATE_PRODUCT_UI.MANAGE_AFFILIATE_HINT
            }
            checked={isAffiliateEnabled}
            disabled={actionsLocked}
            pending={isAffiliateTogglePending}
            pendingLabel={CREATE_PRODUCT_UI.AFFILIATE_TOGGLE_PENDING}
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
            title={CREATE_PRODUCT_UI.MANAGE_VISIBILITY_TITLE_VISIBLE}
            description={
              isListedForOthers
                ? CREATE_PRODUCT_UI.MANAGE_VISIBILITY_HINT_VISIBLE
                : CREATE_PRODUCT_UI.MANAGE_VISIBILITY_HINT_HIDDEN
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
        {showOutOfStockToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_OUT_OF_STOCK_TITLE}
            description={CREATE_PRODUCT_UI.MANAGE_OUT_OF_STOCK_HINT}
            checked={isOutOfStock}
            disabled={actionsLocked}
            pending={isOutOfStockTogglePending}
            pendingLabel={PRODUCT_CARD_UI.OUT_OF_STOCK_TOGGLE_PENDING}
            onPress={() => onOpenOutOfStockSettings?.()}
            onCheckedChange={(next) => {
              if (product._id == null || actionsLocked) {
                return;
              }
              void onSetOutOfStock(String(product._id), next);
            }}
          />
        ) : null}
      </View>
      {showDelete ? (
        <View style={styles.deleteBlock}>
          {isDeletePending ? (
            <Text style={styles.deletePending}>{PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}</Text>
          ) : isDeleteConfirmOpen ? (
            <View style={styles.deleteConfirm}>
              <Text style={styles.deleteConfirmQuestion}>
                {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
              </Text>
              <View style={styles.deleteConfirmActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteConfirmYes,
                    pressed && styles.deleteConfirmPressed,
                  ]}
                  onPress={() => {
                    setIsDeleteConfirmOpen(false);
                    void onDelete(String(product._id));
                  }}
                >
                  <Text style={styles.deleteConfirmYesText}>
                    {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteConfirmCancel,
                    pressed && styles.deleteConfirmPressed,
                  ]}
                  onPress={() => setIsDeleteConfirmOpen(false)}
                >
                  <Text style={styles.deleteConfirmCancelText}>
                    {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && !hasOpenSalesLocked && !disabled && styles.deleteConfirmPressed,
                (disabled || hasOpenSalesLocked) && styles.deleteBtnDisabled,
              ]}
              disabled={disabled || hasOpenSalesLocked}
              onPress={() => setIsDeleteConfirmOpen(true)}
            >
              <Text style={styles.deleteBtnTitle}>{CREATE_PRODUCT_UI.MANAGE_DELETE_TITLE}</Text>
              <Text style={styles.deleteBtnHint}>{CREATE_PRODUCT_UI.MANAGE_DELETE_HINT}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
};
