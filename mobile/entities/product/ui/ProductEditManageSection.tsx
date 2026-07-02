import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";
import { ProductManageToggleRow } from "@/entities/product/ui/ProductManageToggleRow";
import { PRODUCT_MODERATION_APPROVED } from "@/entities/product/model/productModerationConstants";
import { CREATE_PRODUCT_UI, PRODUCT_CARD_UI } from "@/shared/config";
import { useProductEditManageSectionStyles } from "@/shared/theme/modalChromeStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductEditManageSectionProps = {
  product: CatalogProduct;
  onDelete: (productId: string) => void | Promise<void>;
  onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
  onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
  isDeletePending?: boolean;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  errorMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
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
  onOpenInstallmentProgram,
  canOpenInstallmentProgram = true,
  disabled = false,
}: ProductEditManageSectionProps) => {
  const styles = useProductEditManageSectionStyles();
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
  const canOpenInstallment =
    canOpenInstallmentProgram &&
    (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
      PRODUCT_MODERATION_APPROVED;

  const actionsLocked =
    disabled ||
    isDeletePending ||
    isAvailabilityTogglePending ||
    isAuctionTogglePending ||
    isRaffleParticipationPending ||
    isDeleteConfirmOpen ||
    !canEdit;

  const auctionActionsLocked = actionsLocked || hasOpenSalesLocked;
  const visibilityActionsLocked = actionsLocked || hasOpenSalesLocked;

  const handleDeleteConfirmYes = () => {
    if (product._id == null) {
      return;
    }
    void onDelete(String(product._id));
    setIsDeleteConfirmOpen(false);
  };

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
      {hasOpenSalesLocked && showDelete ? (
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
              isDeletePending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              disabled
            }
            pending={isRaffleParticipationPending}
            pendingLabel={PRODUCT_CARD_UI.RAFFLE_PARTICIPATION_PENDING}
            variant="raffle"
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
              isDeletePending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending ||
              isRaffleParticipationPending ||
              !canOpenInstallment
            }
            variant="installment"
            onPress={() => onOpenInstallmentProgram?.()}
          />
        ) : null}
        {showDelete ? (
          isDeletePending ? (
            <ProductManageToggleRow
              title={CREATE_PRODUCT_UI.MANAGE_DELETE_TITLE}
              description={CREATE_PRODUCT_UI.MANAGE_DELETE_HINT}
              pending
              pendingLabel={PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
            />
          ) : isDeleteConfirmOpen ? (
            <View style={styles.deleteConfirm} accessibilityRole="none">
              <Text style={styles.deleteConfirmQuestion}>
                {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
              </Text>
              <View style={styles.deleteConfirmActions}>
                {Platform.OS === "web" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDeleteConfirmYes}
                      style={{ cursor: "pointer", border: "none", background: "transparent", padding: 0 }}
                    >
                      <View style={styles.deleteConfirmYes}>
                        <Text style={styles.deleteConfirmYesText}>
                          {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
                        </Text>
                      </View>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      style={{ cursor: "pointer", border: "none", background: "transparent", padding: 0 }}
                    >
                      <View style={styles.deleteConfirmCancel}>
                        <Text style={styles.deleteConfirmCancelText}>
                          {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
                        </Text>
                      </View>
                    </button>
                  </>
                ) : (
                  <>
                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteConfirmYes,
                        pressed && styles.deleteConfirmPressed,
                      ]}
                      onPress={handleDeleteConfirmYes}
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
                  </>
                )}
              </View>
            </View>
          ) : (
            <ProductManageToggleRow
              title={CREATE_PRODUCT_UI.MANAGE_DELETE_TITLE}
              description={CREATE_PRODUCT_UI.MANAGE_DELETE_HINT}
              disabled={hasOpenSalesLocked || disabled}
              variant="danger"
              onPress={() => setIsDeleteConfirmOpen(true)}
            />
          )
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
