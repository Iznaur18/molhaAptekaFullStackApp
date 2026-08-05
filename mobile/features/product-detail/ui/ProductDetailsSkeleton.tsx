import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MY_ORDERS_PAGE_UI } from "@/shared/config";
import {
  PRODUCT_DETAIL_PURCHASE_DOCK_BOTTOM_INSET,
  PRODUCT_DETAIL_PURCHASE_DOCK_INSET,
  PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS,
} from "@/shared/theme/catalogProductStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SkeletonShimmer } from "@/shared/ui/SkeletonShimmer";
import { SquircleView } from "@/shared/ui/SquircleView";

const useStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  body: {
    flex: 1,
  },
  galleryPad: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  hero: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    marginBottom: 12,
  },
  tab: {
    width: 72,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabShort: {
    width: 52,
  },
  rest: {
    paddingHorizontal: 16,
    gap: 12,
  },
  line: {
    height: 14,
    width: "62%",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  lineTitle: {
    width: "78%",
    height: 18,
  },
  linePrice: {
    width: "36%",
    height: 22,
  },
  lineWide: {
    width: "88%",
  },
  lineShort: {
    width: "44%",
  },
  dock: {
    position: "absolute",
    left: PRODUCT_DETAIL_PURCHASE_DOCK_INSET,
    right: PRODUCT_DETAIL_PURCHASE_DOCK_INSET,
    bottom: PRODUCT_DETAIL_PURCHASE_DOCK_BOTTOM_INSET,
  },
  dockInner: {
    paddingTop: 8.8,
    paddingHorizontal: 12,
    paddingBottom: 10.4,
    backgroundColor: theme.colors.surface,
  },
  cta: {
    height: 48,
    borderRadius: 11.2,
    backgroundColor: theme.colors.surfaceMuted,
  },
}));

/**
 * Плейсхолдер экрана деталей товара (gallery → tabs → lines → CTA dock).
 */
export const ProductDetailsSkeleton = () => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top }]}
      accessibilityRole="progressbar"
      accessibilityLabel={MY_ORDERS_PAGE_UI.PRODUCT_DETAILS_LOADING}
    >
      <SkeletonShimmer style={styles.body}>
        <View style={styles.galleryPad}>
          <SquircleView radius={28} style={styles.hero} />
        </View>

        <View style={styles.tabs}>
          <View style={styles.tab} />
          <View style={styles.tab} />
          <View style={[styles.tab, styles.tabShort]} />
        </View>

        <View style={styles.rest}>
          <View style={[styles.line, styles.lineTitle]} />
          <View style={[styles.line, styles.linePrice]} />
          <View style={[styles.line, styles.lineWide]} />
          <View style={styles.line} />
          <View style={[styles.line, styles.lineShort]} />
        </View>
      </SkeletonShimmer>

      <SquircleView
        radius={PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS}
        outerStyle={styles.dock}
        style={[styles.dockInner, { paddingBottom: Math.max(insets.bottom, 10.4) }]}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.cta} />
      </SquircleView>
    </View>
  );
};
