import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeCuratedCategory } from "@/entities/curated-category-list/api/fetchHomeCuratedCategoryLists";
import { CuratedCategoryCompactCard } from "@/entities/curated-category-list/ui/CuratedCategoryCompactCard";
import {
  CURATED_LIST_VIEW_ALL_SHEET_LAYOUT as L,
  resolveCuratedSheetProductCardWidth,
} from "@/entities/curated-product-list/lib/curatedListViewAllSheetLayout";
import { resolveCuratedCompactCardHeight } from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { CuratedProductCompactCard } from "@/entities/curated-product-list/ui/CuratedProductCompactCard";
import { useWholesalePriceSheetAnimation } from "@/entities/product/model/useWholesalePriceSheetAnimation";
import { CURATED_LIST_CAROUSEL_UI } from "@/shared/config";
import { useCuratedListViewAllSheetStyles } from "@/shared/theme/curatedListViewAllSheetStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type CuratedListViewAllSheetProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  products?: Array<Record<string, unknown> & { _id: string; productName?: string }>;
  categories?: HomeCuratedCategory[];
  onOpenCategory?: (category: HomeCuratedCategory) => void;
};

/**
 * Bottom sheet «Все» — паритет web `CuratedListViewAllSheet`.
 * Клик по карточке открывает сущность; sheet не закрываем (как web).
 */
export const CuratedListViewAllSheet = ({
  isOpen,
  title,
  onClose,
  products = [],
  categories = [],
  onOpenCategory,
}: CuratedListViewAllSheetProps) => {
  const styles = useCuratedListViewAllSheetStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contentWidth, setContentWidth] = useState(0);

  const sheetSlideDistance = useMemo(() => Dimensions.get("window").height, []);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useWholesalePriceSheetAnimation(isOpen, sheetSlideDistance);

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  const showProducts = products.length > 0;
  const showCategories =
    !showProducts && categories.length > 0 && typeof onOpenCategory === "function";

  const productCardWidth = useMemo(
    () => resolveCuratedSheetProductCardWidth(contentWidth),
    [contentWidth],
  );
  const productCardHeight = useMemo(
    () => resolveCuratedCompactCardHeight(productCardWidth),
    [productCardWidth],
  );

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setContentWidth((prev) => (prev === next ? prev : next));
  }, []);

  const openProduct = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}` as never);
    },
    [router],
  );

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
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
          accessibilityLabel={CURATED_LIST_CAROUSEL_UI.SHEET_CLOSE_ARIA}
        />
        <SheetContainer
          style={[styles.panel, sheetAnimatedStyle]}
          accessibilityRole="dialog"
          accessibilityLabel={CURATED_LIST_CAROUSEL_UI.SHEET_ARIA}
          accessibilityViewIsModal
        >
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={[
              styles.body,
              { paddingBottom: L.bodyPadding + Math.max(insets.bottom, 0) },
            ]}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View onLayout={handleContentLayout}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {showProducts && contentWidth > 0 ? (
                <View
                  style={[styles.grid, { gap: L.productCardGap, marginTop: L.bodyGap }]}
                >
                  {products.map((product) => (
                    <View
                      key={product._id}
                      style={{ width: productCardWidth, height: productCardHeight }}
                    >
                      <CuratedProductCompactCard
                        product={product}
                        width={productCardWidth}
                        onOpen={() => openProduct(product._id)}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
              {showCategories && contentWidth > 0 ? (
                <View style={[styles.gridCategories, { marginTop: L.bodyGap }]}>
                  {categories.map((category) => (
                    <CuratedCategoryCompactCard
                      key={category.itemKey}
                      category={category}
                      width={contentWidth}
                      onOpen={onOpenCategory!}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          </ScrollView>
        </SheetContainer>
      </View>
    </Modal>
  );
};
