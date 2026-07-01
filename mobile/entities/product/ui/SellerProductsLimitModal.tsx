import { Modal, Pressable, Text, View } from "react-native";

import { SELLER_PRODUCTS_LIMIT_PREMIUM } from "@/entities/product/model/productConstants";
import { SELLER_PRODUCTS_LIMIT_MODAL_UI } from "@/shared/config";
import { useSellerProductsLimitModalStyles } from "@/shared/theme/modalChromeStyles";

type SellerProductsLimitModalProps = {
  visible: boolean;
  onClose: () => void;
  isPremiumUser: boolean;
  limit: number | null;
};

export const SellerProductsLimitModal = ({
  visible,
  onClose,
  isPremiumUser,
  limit,
}: SellerProductsLimitModalProps) => {
  const styles = useSellerProductsLimitModalStyles();

  if (limit == null) {
    return null;
  }

  const body = isPremiumUser
    ? SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PREMIUM(limit)
    : SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_REGULAR(limit, SELLER_PRODUCTS_LIMIT_PREMIUM);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
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
