import type { ProductBadgeExplainKey } from "@izibuy/shared-lib";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchUserPhone } from "@/entities/user/api/fetchUserPhone";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import { PRODUCT_BADGE_EXPLAIN_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
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
  contactSellerUserId?: string | null;
  onClose: () => void;
  primaryActionLabel?: string | null;
  onPrimaryAction?: () => void;
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
    gap: 8,
  },
  closeButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
    backgroundColor: theme.colors.ink,
  },
  closeButtonDisabled: {
    opacity: 0.55,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: theme.colors.onContrast,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center" as const,
    color: theme.colors.dangerText,
  },
}));

export const ProductBadgeExplainSheet = ({
  visible,
  title,
  badgeKey,
  fallbackKey,
  contactSellerUserId = null,
  onClose,
  primaryActionLabel = null,
  onPrimaryAction,
}: ProductBadgeExplainSheetProps) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const adminByKey = useProductBadgeExplainByKeyMap({ enabled: visible });
  useRegisterBlockingOverlay(visible && !onPrimaryAction);

  const sellerId =
    typeof contactSellerUserId === "string" ? contactSellerUserId.trim() : "";
  const contactMode = sellerId.length > 0;

  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [contactPending, setContactPending] = useState(false);
  const [contactError, setContactError] = useState("");

  const content = resolveProductBadgeExplainSheetContent({
    badgeKey,
    fallbackKey,
    adminRow: badgeKey ? (adminByKey.get(badgeKey) ?? null) : null,
  });

  const imageSrc = content.imageUrl
    ? resolveUploadedMediaUrl(content.imageUrl)
    : null;

  useEffect(() => {
    if (!visible) {
      setRevealedPhone(null);
      setContactPending(false);
      setContactError("");
    }
  }, [visible]);

  useEffect(() => {
    setRevealedPhone(null);
    setContactPending(false);
    setContactError("");
  }, [sellerId, badgeKey]);

  const handleContact = async () => {
    if (!sellerId || contactPending) {
      return;
    }
    setContactPending(true);
    setContactError("");
    try {
      const phone = await fetchUserPhone(sellerId);
      setRevealedPhone(phone);
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : PRODUCT_BADGE_EXPLAIN_UI.CONTACT_ERROR,
      );
    } finally {
      setContactPending(false);
    }
  };

  const phoneHref = revealedPhone ? toRuPhoneTelHref(revealedPhone) : null;
  const phoneDisplay = revealedPhone
    ? formatRuPhoneDisplayOrEmpty(revealedPhone)
    : "";

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
              {contactMode && phoneHref && phoneDisplay ? (
                <Pressable
                  style={styles.closeButton}
                  accessibilityRole="link"
                  accessibilityLabel={phoneDisplay}
                  onPress={() => {
                    void Linking.openURL(phoneHref).catch(() => undefined);
                  }}
                >
                  <Text style={styles.closeButtonText}>{phoneDisplay}</Text>
                </Pressable>
              ) : contactMode ? (
                <>
                  <Pressable
                    style={[
                      styles.closeButton,
                      contactPending ? styles.closeButtonDisabled : null,
                    ]}
                    accessibilityRole="button"
                    disabled={contactPending}
                    onPress={() => {
                      void handleContact();
                    }}
                  >
                    <Text style={styles.closeButtonText}>
                      {contactPending
                        ? PRODUCT_BADGE_EXPLAIN_UI.CONTACT_PENDING
                        : PRODUCT_BADGE_EXPLAIN_UI.CONTACT}
                    </Text>
                  </Pressable>
                  {contactError ? (
                    <Text style={styles.error} accessibilityRole="alert">
                      {contactError}
                    </Text>
                  ) : null}
                </>
              ) : onPrimaryAction ? (
                <Pressable
                  style={styles.closeButton}
                  accessibilityRole="button"
                  onPress={onPrimaryAction}
                >
                  <Text style={styles.closeButtonText}>
                    {primaryActionLabel || PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.closeButton}
                  accessibilityRole="button"
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>
                    {PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
                  </Text>
                </Pressable>
              )}
            </View>
          </SquircleView>
        </View>
      </View>
    </Modal>
  );
};
