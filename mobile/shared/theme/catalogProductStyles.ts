import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const MEDIA_OVERLAY_SCRIM = "rgba(0,0,0,0.55)";
export const MEDIA_NAV_SCRIM = "rgba(0,0,0,0.45)";

export const useFeedScreenStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  listContent: {
    padding: 6,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
  browserLink: {
    marginHorizontal: theme.spacing[2],
    marginBottom: theme.spacing[2],
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.actionSurface,
  },
  browserLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.action,
  },
}));

export const useCatalogFilterChipStyles = createThemedStyles((theme) => ({
  wrap: {
    paddingVertical: theme.spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: {
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  chipActive: {
    backgroundColor: theme.colors.nearBlack,
  },
  chipOutline: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useCatalogSearchBarStyles = createThemedStyles((theme) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  clear: {
    paddingHorizontal: theme.spacing[1],
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.link,
  },
}));

export const useCatalogSubcategoryChipStyles = createThemedStyles((theme) => ({
  wrap: {
    paddingBottom: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  row: {
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useProductCardStyles = createThemedStyles((theme) => ({
  card: {
    flex: 1,
    position: "relative",
    margin: 6,
    padding: theme.spacing[2],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  pressable: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  wishlistSlot: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  unavailableBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
  },
  unavailableText: {
    fontSize: 10,
    color: theme.colors.onContrast,
  },
  name: {
    marginTop: theme.spacing[2],
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  rating: {
    marginTop: theme.spacing[1],
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));

export const useProductPriceStyles = createThemedStyles((theme) => ({
  cardRoot: {
    gap: 2,
  },
  inlineRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: theme.spacing[2],
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  current: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardCurrent: {
    fontSize: 15,
    fontWeight: "700",
  },
  old: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: theme.colors.danger,
  },
  badgeOverlay: {
    position: "absolute",
    top: theme.spacing[2],
    left: theme.spacing[2],
  },
  badgeText: {
    color: theme.colors.onContrast,
    fontSize: 11,
    fontWeight: "700",
  },
}));

export const useProductStatusBadgeStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: 6,
    backgroundColor: theme.colors.actionSurface,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.action,
  },
}));

export const useProductDetailFieldStyles = createThemedStyles((theme) => ({
  grid: {
    gap: 10,
  },
  row: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
}));

export const useProductSellerPreviewStyles = createThemedStyles((theme) => ({
  section: {
    marginTop: theme.spacing[5],
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing[2],
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  premium: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.warning,
  },
}));

export const useProductMediaGalleryStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
  },
  hero: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  navRow: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[2],
    transform: [{ translateY: -20 }],
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MEDIA_NAV_SCRIM,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: theme.colors.onContrast,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  counter: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: 6,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
    color: theme.colors.onContrast,
    fontSize: 12,
    fontWeight: "600",
  },
  thumbs: {
    marginTop: 10,
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbActive: {
    borderColor: theme.colors.nearBlack,
    borderWidth: 2,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbVideoLabel: {
    fontSize: 18,
    color: theme.colors.text,
  },
}));

export const useProductDetailScreenStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
  rating: {
    marginTop: theme.spacing[2],
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  availability: {
    marginTop: theme.spacing[2],
    fontSize: 14,
    color: theme.colors.success,
  },
  unavailable: {
    color: theme.colors.danger,
  },
  section: {
    marginTop: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[1],
  },
  sectionBody: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  reportButton: {
    marginTop: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.danger,
  },
  reportButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  reportSuccess: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    color: theme.colors.success,
    textAlign: "center",
  },
  sellerActions: {
    marginTop: theme.spacing[5],
    flexDirection: "row",
    gap: 10,
  },
  sellerActionButton: {
    flex: 1,
  },
  promoteButtonDisabled: {
    opacity: 0.55,
  },
}));

export const useProductDetailTabBarStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  tab: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: theme.colors.nearBlack,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.onContrast,
  },
}));

export const useProductDetailTabStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[3],
    paddingTop: theme.spacing[2],
  },
  summary: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  panel: {
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceElevated,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  input: {
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 10,
    fontSize: 15,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surface,
  },
  optionActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  list: {
    gap: 10,
  },
  item: {
    padding: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing[1],
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  itemMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  itemBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  success: {
    fontSize: 13,
    color: theme.colors.success,
  },
  stars: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  star: {
    fontSize: 28,
    color: theme.colors.starMuted,
  },
  starActive: {
    color: theme.colors.star,
  },
  disabled: {
    opacity: 0.6,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    paddingTop: theme.spacing[2],
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  status: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  compactInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  planCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    padding: theme.spacing[3],
  },
  planCardSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  planMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing[1],
  },
  methodChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
  },
  methodChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  methodText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  methodTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  summaryStrong: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
  },
  tabContainer: {
    paddingTop: theme.spacing[2],
    gap: theme.spacing[2],
  },
}));

export const useCartScreenStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  list: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[8],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  footer: {
    paddingTop: theme.spacing[2],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[1],
  },
  totalLabel: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fullTotalHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[3],
  },
  checkoutHint: {
    fontSize: 14,
    color: theme.colors.danger,
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
  checkoutButton: {
    marginBottom: theme.spacing[2],
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: theme.spacing[2],
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));

export const useHomeFeaturedRafflesStyles = createThemedStyles((theme) => ({
  scroll: {
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    gap: 10,
  },
  card: {
    width: 260,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.raffleSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.raffleBorder,
    padding: 14,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.warning,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing[2],
  },
  cta: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
  },
}));

export const useHomeCuratedListsStyles = createThemedStyles((theme) => ({
  listBlock: {
    marginBottom: theme.spacing[3],
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginHorizontal: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  row: {
    paddingHorizontal: 6,
    gap: theme.spacing[1],
  },
  cardWrap: {
    width: 168,
  },
}));

export const useUserStoriesStripStyles = createThemedStyles((theme) => ({
  scroll: {
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  item: {
    width: 72,
    alignItems: "center",
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringViewed: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringAdd: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.action,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 28,
    fontWeight: "300",
    color: theme.colors.action,
    lineHeight: 30,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  label: {
    marginTop: theme.spacing[1],
    fontSize: 11,
    color: theme.colors.textSecondary,
    maxWidth: 72,
    textAlign: "center",
  },
}));

export const useCatalogBrowserPageStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: theme.spacing[1],
    color: theme.colors.text,
  },
  sectionLabel: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: theme.colors.textMuted,
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
}));

export const useCatalogBrowserTileStyles = createThemedStyles((theme) => ({
  wrap: {
    position: "relative",
    minWidth: "47%",
    flexGrow: 1,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  imageWrap: {
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  label: {
    paddingHorizontal: 10,
    paddingVertical: theme.spacing[3],
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: theme.colors.text,
  },
  editButton: {
    position: "absolute",
    top: theme.spacing[2],
    right: theme.spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.nearBlack,
  },
  editButtonText: {
    color: theme.colors.onContrast,
    fontSize: 14,
    lineHeight: 16,
  },
}));
