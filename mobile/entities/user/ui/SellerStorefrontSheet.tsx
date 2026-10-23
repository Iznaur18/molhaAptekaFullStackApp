import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSellerStorefrontSheetStyles } from "@/shared/theme/sellerStorefrontSheetStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type SellerStorefrontSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
};

/**
 * Каркас окна снизу на витрине — общий для «QR-код» и «Соцсети и сайт»,
 * как web `SellerQrSheet.css`: шапка с заголовком и «Закрыть», тело с линией.
 */
export const SellerStorefrontSheet = ({
  visible,
  onClose,
  title,
  closeLabel,
  children,
}: SellerStorefrontSheetProps) => {
  const styles = useSellerStorefrontSheetStyles();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View style={styles.panel} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.close}>{closeLabel}</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.body,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
