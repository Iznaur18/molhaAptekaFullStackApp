import { Modal, Pressable, Text, View } from "react-native";

import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "@/entities/product/model/productConstants";
import { SELLER_PRODUCTS_LIMIT_MODAL_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useSellerProductsLimitModalStyles } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type SellerProductsLimitModalProps = {
  visible: boolean;
  onClose: () => void;
  isPremiumUser: boolean;
  limit: number | null;
  hasPersonalOverride?: boolean;
};

function resolveLimitModalBody(
  limit: number,
  isPremiumUser: boolean,
  hasPersonalOverride: boolean,
): string {
  if (hasPersonalOverride) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PERSONAL(limit);
  }
  if (isPremiumUser && limit === SELLER_PRODUCTS_LIMIT_PREMIUM) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PREMIUM(limit);
  }
  if (!isPremiumUser && limit === SELLER_PRODUCTS_LIMIT_REGULAR) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_REGULAR(
      limit,
      SELLER_PRODUCTS_LIMIT_PREMIUM,
    );
  }
  return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PERSONAL(limit);
}

export const SellerProductsLimitModal = ({
  visible,
  onClose,
  isPremiumUser,
  limit,
  hasPersonalOverride = false,
}: SellerProductsLimitModalProps) => {
  const styles = useSellerProductsLimitModalStyles();
  useRegisterBlockingOverlay(visible && limit != null);

  if (limit == null) {
    return null;
  }

  const body = resolveLimitModalBody(limit, isPremiumUser, hasPersonalOverride);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{SELLER_PRODUCTS_LIMIT_MODAL_UI.TITLE}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>{SELLER_PRODUCTS_LIMIT_MODAL_UI.CLOSE}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
