import { isProductAffiliateConfigured, isProductWholesaleConfigured } from "@izibuy/shared-lib";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
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
  onSetWholesale?: (productId: string, productWholesaleEnabled: boolean) => void | Promise<void>;
  onSetAffiliate?: (
    productId: string,
    affiliateEnabled: boolean,
    product?: CatalogProduct,
  ) => void | Promise<void>;
  onSetInstallment?: (
    productId: string,
    productInstallmentEnabled: boolean,
  ) => void | Promise<void | { needsSetup?: boolean }>;
  onDelete?: (productId: string) => void | Promise<void>;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  isOriginalityTogglePending?: boolean;
  isWholesaleTogglePending?: boolean;
  isAffiliateTogglePending?: boolean;
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
  onOpenAffiliateSettings?: () => void;
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
  onSetWholesale,
  onSetAffiliate,
  onSetInstallment,
  onDelete,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  isOriginalityTogglePending = false,
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
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
  onOpenWholesaleSettings,
  onOpenAffiliateSettings,
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
  const isInstallmentEnabled = product.productInstallmentEnabled === true;
  const isWholesaleEnabled = product.productWholesaleEnabled === true;
  const isAffiliateEnabled = resolveAffiliateEnabled(product);
  const affiliatePercent = resolveAffiliatePercent(product);
  const wholesaleConfigured = isProductWholesaleConfigured(product);
  const affiliateConfigured = isProductAffiliateConfigured(product);
  const showWholesale =
    typeof onOpenWholesaleSettings === "function" || typeof onSetWholesale === "function";
  const showAffiliate =
    typeof onOpenAffiliateSettings === "function" || typeof onSetAffiliate === "function";
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
