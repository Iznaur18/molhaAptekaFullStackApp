import type { ProductBadgeExplainKey } from "@izibuy/shared-lib";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PRODUCT_BADGE_EXPLAIN_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

import { resolveProductBadgeExplainSheetContent } from "../lib/resolveProductBadgeExplainSheet";
import { useProductBadgeExplainByKeyMap } from "../model/useProductBadgeExplainByKeyMap";

const SHEET_RADIUS = 32;

const SHEET_CORNER_RADII = {
  topLeft: SHEET_RADIUS,
  topRight: SHEET_RADIUS,
  bottomLeft: 0,
  bottomRight: 0,
} as const;

type ProductBadgeExplainSheetProps = {
  visible: boolean;
  title: string;
  badgeKey: ProductBadgeExplainKey | null;
  fallbackKey: string;
  onClose: () => void;
};

const useStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end" as const,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  dismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  shell: {
    width: "100%",
    maxHeight: "70%",
  },
  dialog: {
    backgroundColor: theme.colors.surface,
    overflow: "hidden" as const,
  },
  dialogShadow: {
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
  },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.bg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
    color: theme.colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  closeButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
    backgroundColor: theme.colors.ink,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: theme.colors.onContrast,
  },
}));

export const ProductBadgeExplainSheet = ({
  visible,
  title,
  badgeKey,
  fallbackKey,
  onClose,
}: ProductBadgeExplainSheetProps) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const adminByKey = useProductBadgeExplainByKeyMap({ enabled: visible });

  const content = resolveProductBadgeExplainSheetContent({
    badgeKey,
    fallbackKey,
    adminRow: badgeKey ? adminByKey.get(badgeKey) ?? null : null,
  });

  const imageSrc = content.imageUrl
    ? resolveUploadedMediaUrl(content.imageUrl)
    : null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "fade" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={onClose} accessibilityRole="button" />
        <View style={styles.shell}>
          <SquircleView
            cornerRadii={SHEET_CORNER_RADII}
            style={styles.dialog}
            shadowStyle={styles.dialogShadow}
            accessibilityRole="summary"
            accessibilityLabel={PRODUCT_BADGE_EXPLAIN_UI.ARIA_DIALOG}
          >
            <ScrollView bounces={false}>
              {imageSrc ? (
                <View style={styles.media}>
                  <Image
                    source={{ uri: imageSrc }}
                    style={styles.image}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                </View>
              ) : null}
              <View style={styles.body}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{content.description}</Text>
              </View>
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <Pressable
                style={styles.closeButton}
                accessibilityRole="button"
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>{PRODUCT_BADGE_EXPLAIN_UI.CLOSE}</Text>
              </Pressable>
            </View>
          </SquircleView>
        </View>
      </View>
    </Modal>
  );
};
