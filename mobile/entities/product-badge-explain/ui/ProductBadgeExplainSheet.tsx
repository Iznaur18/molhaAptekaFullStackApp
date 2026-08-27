import type { ProductBadgeExplainKey } from "@izibuy/shared-lib";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchUserPhone } from "@/entities/user/api/fetchUserPhone";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "@/entities/user/lib/ruPhone";
import {
  estimateProductBadgeExplainSheetSlideDistance,
  useProductBadgeExplainSheetAnimation,
} from "@/entities/product-badge-explain/model/useProductBadgeExplainSheetAnimation";
import { PRODUCT_BADGE_EXPLAIN_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT } from "@/shared/lib/productBadgeExplainSheetLayout";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useProductBadgeExplainSheetStyles } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { SquircleView } from "@/shared/ui/SquircleView";

import { resolveProductBadgeExplainSheetContent } from "../lib/resolveProductBadgeExplainSheet";
import { useProductBadgeExplainByKeyMap } from "../model/useProductBadgeExplainByKeyMap";

const SHEET_CORNER_RADII = {
  topLeft: PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT.panelTopRadius,
  topRight: PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT.panelTopRadius,
  bottomLeft: 0,
  bottomRight: 0,
} as const;

type ProductBadgeExplainSheetProps = {
  visible: boolean;
  title: string;
  badgeKey?: ProductBadgeExplainKey | null;
  fallbackKey?: string;
  description?: string | null;
  contactSellerUserId?: string | null;
  onClose: () => void;
  primaryActionLabel?: string | null;
  onPrimaryAction?: () => void;
};

export const ProductBadgeExplainSheet = ({
  visible,
  title,
  badgeKey = null,
  fallbackKey = "listing_origin_unspecified",
  description = null,
  contactSellerUserId = null,
  onClose,
  primaryActionLabel = null,
  onPrimaryAction,
}: ProductBadgeExplainSheetProps) => {
  const styles = useProductBadgeExplainSheetStyles();
  const { colorScheme } = useAppThemeSettings();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const maxPanelHeight = windowHeight * PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT.panelMaxHeightRatio;
  const [panelHeight, setPanelHeight] = useState(0);
  const estimatedSlideDistance = useMemo(
    () => estimateProductBadgeExplainSheetSlideDistance(windowWidth, windowHeight),
    [windowHeight, windowWidth],
  );
  const sheetSlideDistance = panelHeight > 0 ? panelHeight : estimatedSlideDistance;
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useProductBadgeExplainSheetAnimation(visible, sheetSlideDistance);
  const descriptionOverride =
    typeof description === "string" ? description.trim() : "";
  const hasDescriptionOverride = descriptionOverride.length > 0;
  const adminByKey = useProductBadgeExplainByKeyMap({
    enabled: modalVisible && !hasDescriptionOverride,
  });
  useRegisterBlockingOverlay(modalVisible && !onPrimaryAction);

  const sellerId =
    typeof contactSellerUserId === "string" ? contactSellerUserId.trim() : "";
  const contactMode = sellerId.length > 0;

  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [contactPending, setContactPending] = useState(false);
  const [contactError, setContactError] = useState("");

  const resolvedContent = resolveProductBadgeExplainSheetContent({
    badgeKey,
    fallbackKey,
    adminRow: badgeKey ? (adminByKey.get(badgeKey) ?? null) : null,
  });
  const content = hasDescriptionOverride
    ? { description: descriptionOverride, imageUrl: null }
    : resolvedContent;

  const imageSrc = content.imageUrl
    ? resolveUploadedMediaUrl(content.imageUrl)
    : null;

  useEffect(() => {
    if (!visible) {
      setRevealedPhone(null);
      setContactPending(false);
      setContactError("");
      setPanelHeight(0);
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

  if (!modalVisible) {
    return null;
  }

  const footerPaddingBottom = Math.max(
    insets.bottom,
    PRODUCT_BADGE_EXPLAIN_SHEET_LAYOUT.footerPaddingBottom,
  );

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <BackdropContainer style={[styles.backdrop, backdropAnimatedStyle]} pointerEvents="box-none">
          <ModalSheetGradientBackdrop />
          <Pressable
            style={styles.dismiss}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
          />
        </BackdropContainer>

        <SheetContainer
          style={[styles.panelHost, sheetAnimatedStyle, { maxHeight: maxPanelHeight }]}
          onLayout={(event) => {
            const nextHeight = Math.round(event.nativeEvent.layout.height);
            if (nextHeight > 0 && nextHeight !== panelHeight) {
              setPanelHeight(nextHeight);
            }
          }}
        >
          <SquircleView
            cornerRadii={SHEET_CORNER_RADII}
            style={styles.panel}
            shadowStyle={styles.panelShadow}
            accessibilityRole="summary"
            accessibilityLabel={PRODUCT_BADGE_EXPLAIN_UI.ARIA_DIALOG}
          >
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

            <ScrollView
              style={styles.bodyScroll}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.body}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{content.description}</Text>
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
              {contactMode && phoneHref && phoneDisplay ? (
                <Pressable
                  style={[styles.closeButton, isDark && styles.closeButtonDark]}
                  accessibilityRole="link"
                  accessibilityLabel={phoneDisplay}
                  onPress={() => {
                    void Linking.openURL(phoneHref).catch(() => undefined);
                  }}
                >
                  <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>
                    {phoneDisplay}
                  </Text>
                </Pressable>
              ) : contactMode ? (
                <>
                  <Pressable
                    style={[
                      styles.closeButton,
                      isDark && styles.closeButtonDark,
                      contactPending ? styles.closeButtonDisabled : null,
                    ]}
                    accessibilityRole="button"
                    disabled={contactPending}
                    onPress={() => {
                      void handleContact();
                    }}
                  >
                    <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>
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
                  style={[styles.closeButton, isDark && styles.closeButtonDark]}
                  accessibilityRole="button"
                  onPress={onPrimaryAction}
                >
                  <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>
                    {primaryActionLabel || PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.closeButton, isDark && styles.closeButtonDark]}
                  accessibilityRole="button"
                  onPress={onClose}
                >
                  <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>
                    {PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
                  </Text>
                </Pressable>
              )}
            </View>
          </SquircleView>
        </SheetContainer>
      </View>
    </Modal>
  );
};
