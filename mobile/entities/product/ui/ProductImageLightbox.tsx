import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isDisplayableMediaUrl } from "@/shared/lib";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

const LIGHTBOX_PADDING = 16;
const NAV_BUTTON_SIZE = 36;
/** Ширина двух кнопок навигации с зазорами — как `5.5rem` в вебе. */
const NAV_RESERVED_WIDTH = 88;
const BACKDROP_SCRIM = "rgba(0, 0, 0, 0.86)";

const filterDisplayableImageUrls = (imageUrls: string[]): string[] => {
  if (!Array.isArray(imageUrls)) {
    return [];
  }
  return imageUrls
    .map((raw) => String(raw ?? "").trim())
    .filter((url) => url.length > 0 && isDisplayableMediaUrl(url));
};

type ProductImageLightboxProps = {
  visible: boolean;
  imageUrls: string[];
  startIndex?: number;
  onClose: () => void;
};

/**
 * Полноэкранный просмотр фото товара.
 *
 * Портировано с `client/.../ProductImageLightbox.jsx` — включая раскладку,
 * счётчик и подписи. Веб-компонент сейчас никем не импортируется (осиротел
 * после переезда галереи на ProductMediaGalleryReadonly), но взят как образец,
 * чтобы при его возврате в веб обе платформы выглядели одинаково.
 */
export const ProductImageLightbox = ({
  visible,
  imageUrls,
  startIndex = 0,
  onClose,
}: ProductImageLightboxProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const urls = useMemo(() => filterDisplayableImageUrls(imageUrls), [imageUrls]);
  const [index, setIndex] = useState(0);

  const len = urls.length;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const max = Math.max(0, len - 1);
    setIndex(Math.min(Math.max(0, startIndex), max));
  }, [len, startIndex, visible]);

  const safeIndex = Math.min(index, Math.max(0, len - 1));

  const goPrev = useCallback(() => {
    if (len <= 1) {
      return;
    }
    setIndex((current) => (current - 1 + len) % len);
  }, [len]);

  const goNext = useCallback(() => {
    if (len <= 1) {
      return;
    }
    setIndex((current) => (current + 1) % len);
  }, [len]);

  if (!visible || len === 0) {
    return null;
  }

  const availableWidth = windowWidth - LIGHTBOX_PADDING * 2;
  const availableHeight = windowHeight - LIGHTBOX_PADDING * 2 - insets.top - insets.bottom - 96;
  const viewport = Math.max(
    120,
    Math.min(
      availableHeight,
      len > 1 ? availableWidth - NAV_RESERVED_WIDTH : availableWidth,
    ),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View
        style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        accessibilityLabel={
          len > 1
            ? PRODUCT_CARD_UI.IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY
            : PRODUCT_CARD_UI.IMAGE_LIGHTBOX_DIALOG_LABEL
        }
      >
        {/* Тап мимо снимка закрывает просмотр — на телефоне это основной жест. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_CLOSE}
        />

        <View style={styles.surface} pointerEvents="box-none">
          <Pressable
            style={[
              styles.close,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_CLOSE}
          >
            <MaterialIcons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <View style={styles.stage} pointerEvents="box-none">
            {len > 1 ? (
              <Pressable
                style={[
                  styles.nav,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={goPrev}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={PRODUCT_CARD_UI.GALLERY_PREV}
              >
                <MaterialIcons name="chevron-left" size={24} color={theme.colors.text} />
              </Pressable>
            ) : null}

            <View style={[styles.imageBox, { width: viewport, height: viewport }]}>
              <CachedProductImage
                uri={urls[safeIndex]}
                style={styles.image}
                contentFit="contain"
                priority="high"
              />
            </View>

            {len > 1 ? (
              <Pressable
                style={[
                  styles.nav,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={goNext}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={PRODUCT_CARD_UI.GALLERY_NEXT}
              >
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.text} />
              </Pressable>
            ) : null}
          </View>

          {len > 1 ? (
            <Text
              style={styles.counter}
              accessibilityLiveRegion="polite"
              accessibilityLabel={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(safeIndex + 1, len)}
            >
              {safeIndex + 1} / {len}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: LIGHTBOX_PADDING,
    backgroundColor: BACKDROP_SCRIM,
  },
  surface: {
    alignItems: "flex-end",
    gap: 5.6,
  },
  close: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8.8,
  },
  stage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5.6,
  },
  nav: {
    width: NAV_BUTTON_SIZE,
    height: NAV_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: NAV_BUTTON_SIZE / 2,
  },
  imageBox: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  counter: {
    alignSelf: "center",
    fontSize: 14.4,
    fontWeight: "600",
    color: "#ffffff",
  },
});
