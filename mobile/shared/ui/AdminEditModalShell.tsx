import { type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";
import { useAdminEditModalStyles } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type AdminEditModalShellProps = {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  dismissDisabled?: boolean;
  children: ReactNode;
};

export const AdminEditModalShell = ({
  visible,
  onClose,
  onDismissed,
  dismissDisabled = false,
  children,
}: AdminEditModalShellProps) => {
  const styles = useAdminEditModalStyles();
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle } =
    useAdminEditModalAnimation(visible, onDismissed);

  if (!modalVisible) {
    return null;
  }

  const handleRequestClose = () => {
    if (dismissDisabled) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      onRequestClose={handleRequestClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
          pointerEvents={dismissDisabled ? "none" : "box-none"}
        >
          <ModalSheetGradientBackdrop />
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={onClose}
            disabled={dismissDisabled}
            pointerEvents={dismissDisabled ? "none" : "auto"}
            accessibilityRole="button"
          />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetAnimatedStyle]} pointerEvents="box-none">
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>{children}</View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
