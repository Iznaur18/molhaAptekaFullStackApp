import { type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CREATE_RAFFLE_MODAL_UI } from "@/shared/config";
import { useProductModalShellStyles } from "@/shared/theme/modalChromeStyles";

const PANEL_LG_MAX_WIDTH = 768;
const PANEL_MD_MAX_WIDTH = 480;
const PANEL_MAX_HEIGHT_RATIO = 0.88;

type ProductModalShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
  scrollBody?: boolean;
  fullScreen?: boolean;
};

export const ProductModalShell = ({
  title,
  onClose,
  children,
  footer,
  size = "lg",
  scrollBody = true,
  fullScreen = false,
}: ProductModalShellProps) => {
  const styles = useProductModalShellStyles();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const panelMaxWidth = size === "md" ? PANEL_MD_MAX_WIDTH : PANEL_LG_MAX_WIDTH;
  const panelMaxHeight = Math.floor(windowHeight * PANEL_MAX_HEIGHT_RATIO);

  const body = scrollBody ? (
    <ScrollView
      style={styles.bodyScroll}
      contentContainerStyle={styles.bodyContent}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.bodyScroll, styles.bodyContent]}>{children}</View>
  );

  return (
    <View
      style={[
        fullScreen ? styles.backdropFullScreen : styles.backdrop,
        fullScreen
          ? {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            }
          : {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
      ]}
    >
      {!fullScreen ? (
        <Pressable
          style={styles.backdropDismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_CLOSE}
        />
      ) : null}
      <View
        style={[
          fullScreen ? styles.panelFullScreen : styles.panel,
          !fullScreen && {
            maxWidth: panelMaxWidth,
            maxHeight: panelMaxHeight,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_CLOSE}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
};
