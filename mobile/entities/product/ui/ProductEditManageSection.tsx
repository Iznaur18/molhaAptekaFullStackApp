import { Text, View } from "react-native";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
import { useProductManageToggleImagesByVariant } from "@/entities/product-manage-toggle-display/model/useProductManageToggleImagesByVariant";
import { ProductManageToggleRow } from "@/entities/product/ui/ProductManageToggleRow";
import { PRODUCT_MODERATION_APPROVED } from "@/entities/product/model/productModerationConstants";
import { CREATE_PRODUCT_UI, PRODUCT_CARD_UI } from "@/shared/config";
import { useProductEditManageSectionStyles } from "@/shared/theme/modalChromeStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductEditManageSectionProps = {
  product: CatalogProduct;
  onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
  onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  errorMessage?: string;
  canEdit?: boolean;
  canToggleVisibility?: boolean;
  sellerRaffleActive?: boolean;
  onToggleRaffleParticipation?: (product: CatalogProduct, enabled: boolean) => void;
  isRaffleParticipationPending?: boolean;
  onOpenInstallmentProgram?: () => void;
  canOpenInstallmentProgram?: boolean;
  disabled?: boolean;
};

export const ProductEditManageSection = ({
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
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
  disabled = false,
}: ProductEditManageSectionProps) => {
  const styles = useProductEditManageSectionStyles();
  const { imageByVariant } = useProductManageToggleImagesByVariant();

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
    <View
      style={styles.root}
      accessibilityLabel={CREATE_PRODUCT_UI.MANAGE_SECTION_ARIA}
    >
      <Text style={styles.title}>{CREATE_PRODUCT_UI.MANAGE_SECTION_TITLE}</Text>
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
      {showOpenSalesHint ? (
        <Text style={styles.openSalesHint}>{PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}</Text>
      ) : null}
      <View style={styles.toggles}>
        {showAuctionToggle ? (
          <ProductManageToggleRow
            title={CREATE_PRODUCT_UI.MANAGE_AUCTION_TITLE}
            titleStatus={
              isAuctionEnabled
                ? CREATE_PRODUCT_UI.MANAGE_AUCTION_STATUS_ACTIVE
                : CREATE_PRODUCT_UI.MANAGE_AUCTION_STATUS_INACTIVE
            }
            description={CREATE_PRODUCT_UI.MANAGE_AUCTION_HINT}
            checked={isAuctionEnabled}
            disabled={auctionActionsLocked}
            pending={isAuctionTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AUCTION_TOGGLE_PENDING}
            variant="auction"
            imageUrl={imageByVariant.auction}
            onPress={() => {
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
            titleStatus={
              isRaffleParticipant ? CREATE_PRODUCT_UI.MANAGE_RAFFLE_STATUS_ACTIVE : undefined
            }
            description={CREATE_PRODUCT_UI.MANAGE_RAFFLE_HINT}
            checked={isRaffleParticipant}
            disabled={
              isRaffleParticipationPending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              disabled
            }
            pending={isRaffleParticipationPending}
            pendingLabel={PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_PENDING}
            variant="raffle"
            imageUrl={imageByVariant.raffle}
            onPress={() => {
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
              isRaffleParticipationPending ||
              !canOpenInstallment
            }
            variant="installment"
            imageUrl={imageByVariant.installment}
            onPress={() => onOpenInstallmentProgram?.()}
          />
        ) : null}
        {showVisibility ? (
          <ProductManageToggleRow
            title={
              isListedForOthers
                ? CREATE_PRODUCT_UI.MANAGE_VISIBILITY_TITLE_VISIBLE
                : CREATE_PRODUCT_UI.MANAGE_VISIBILITY_TITLE_HIDDEN
            }
            titleStatus={
              isListedForOthers
                ? CREATE_PRODUCT_UI.MANAGE_VISIBILITY_STATUS_VISIBLE
                : CREATE_PRODUCT_UI.MANAGE_VISIBILITY_STATUS_HIDDEN
            }
            description={
              isListedForOthers
                ? CREATE_PRODUCT_UI.MANAGE_VISIBILITY_HINT_VISIBLE
                : CREATE_PRODUCT_UI.MANAGE_VISIBILITY_HINT_HIDDEN
            }
            checked={isListedForOthers}
            disabled={visibilityActionsLocked}
            pending={isAvailabilityTogglePending}
            pendingLabel={PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
            imageUrl={imageByVariant.default}
            onPress={() => {
              if (product._id == null || visibilityActionsLocked) {
                return;
              }
              void onSetAvailability(String(product._id), !isListedForOthers);
            }}
          />
        ) : null}
      </View>
    </View>
  );
};
