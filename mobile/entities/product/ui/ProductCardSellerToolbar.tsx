import { Pressable, Text, View } from "react-native";

import { isProductPromoteButtonDisabled } from "@/entities/product/lib/isProductPromoteButtonDisabled";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardSellerToolbarStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardSellerToolbarProps = {
  onPromote?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  isDeletePending?: boolean;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
};

export const ProductCardSellerToolbar = ({
  onPromote,
  onEdit,
  canEdit = true,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
}: ProductCardSellerToolbarProps) => {
  const styles = useProductCardSellerToolbarStyles();
  const promoteDisabled = isProductPromoteButtonDisabled({
    isDeletePending,
    isAvailabilityTogglePending,
    isAuctionTogglePending,
  });
  const showPromote = typeof onPromote === "function";
  const showEdit = typeof onEdit === "function" && canEdit;

  if (!showPromote && !showEdit) {
    return null;
  }

  return (
    <View
      style={styles.toolbar}
      accessibilityLabel={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
    >
      {showPromote ? (
        <Pressable
          style={[styles.promoteButton, promoteDisabled && styles.buttonDisabled]}
          disabled={promoteDisabled}
          onPress={onPromote}
        >
          <Text style={styles.promoteButtonText} numberOfLines={1}>
            {PRODUCT_CARD_UI.PROMOTION_BUTTON}
          </Text>
        </Pressable>
      ) : null}
      {showEdit ? (
        <Pressable
          style={[styles.editButton, isDeletePending && styles.buttonDisabled]}
          disabled={isDeletePending}
          onPress={onEdit}
        >
          <Text style={styles.editButtonText} numberOfLines={1}>
            {PRODUCT_CARD_UI.EDIT_PRODUCT}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
