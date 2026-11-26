import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWholesalePriceSheetAnimation } from "@/entities/product/model/useWholesalePriceSheetAnimation";
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
 * Каркас окна снизу на витрине — общий для QR / соцсетей / игр.
 * Backdrop fade + sheet slide отдельно (как CuratedListViewAllSheet),
 * не RN `animationType="slide"` — иначе затемнение едет вместе с панелью.
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
  const sheetSlideDistance = useMemo(() => Dimensions.get("window").height, []);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useWholesalePriceSheetAnimation(visible, sheetSlideDistance);

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BackdropContainer
          style={[StyleSheet.absoluteFillObject, backdropAnimatedStyle]}
          pointerEvents="none"
        >
          <ModalSheetGradientBackdrop />
        </BackdropContainer>
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <SheetContainer
          style={[styles.panel, sheetAnimatedStyle]}
          accessibilityViewIsModal
        >
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
        </SheetContainer>
      </View>
    </Modal>
  );
};
