import { Platform, StyleSheet } from "react-native";

import { PRODUCT_CARD_MOBILE_CATALOG_LAYOUT } from "@/entities/product/lib/productCardMobileCatalogLayout";
import { PROFILE_ACCOUNT_STACK_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Чипы дня/часа/минут — паритет полей даты и времени web `DealRequestSheet`. */
export const useDealRequestTimePickerStyles = createThemedStyles((theme, layout) => ({
  root: {
    gap: 10,
  },
  label: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  row: {
    flexGrow: 0,
  },
  rowContent: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  minuteRow: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  chipActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  chipTextActive: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
  },
}));

/** Окно заявки снизу — паритет web `DealRequestSheet.css`. */
export const useDealRequestSheetStyles = createThemedStyles((theme, layout) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    maxHeight: "92%",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  body: {
    gap: 14,
    padding: 20,
  },
  title: {
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  hint: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  textarea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  error: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
}));

/** Кнопки заявки и телефона на месте «В корзину». */
export const useProductDealActionsStyles = createThemedStyles((theme, layout) => ({
  root: {
    width: "100%",
    minWidth: 0,
    gap: 8,
  },
  rootInline: {
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestButton: {
    flex: 1,
  },
  /** web `.product-deal-actions_card .product-deal-actions__button`. */
  cardButton: {
    width: "100%",
    height: PRODUCT_CARD_MOBILE_CATALOG_LAYOUT.actionHeight,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.action,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  /** web: в `.product-card__banner-actions` блок по ширине надписи, слева. */
  rootBanner: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  cardButtonBanner: {
    width: "auto",
    height: undefined,
    paddingVertical: 8.8,
    paddingHorizontal: 13.6,
    borderRadius: 10.5,
  },
  cardButtonPressed: {
    opacity: 0.85,
  },
  cardButtonText: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  phoneButtonDisabled: {
    opacity: 0.55,
  },
  phoneText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  hint: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  error: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
}));

/** Карточка заявки и раздел «Заявки» — паритет web `DealRequestCard.css`. */
export const useDealRequestsPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: L.stackGap,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
  },
  contentInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
  root: {
    gap: 14,
  },
  title: {
    fontSize: theme.typography.font4xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  lead: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  state: {
    gap: 10,
    alignItems: "flex-start",
  },
  stateText: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  /** web `.deal-requests-page__list { gap: 0.75rem }` */
  list: {
    gap: 12,
  },
  /** web `.deal-request-card` pad 1rem, r 1.125rem, gap 0.6rem */
  card: {
    gap: 9.6,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cardClosed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  kind: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  status: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusText: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  product: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  price: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  facts: {
    gap: 6,
  },
  fact: {
    flexDirection: "row",
    gap: 8,
  },
  factLabel: {
    width: 120,
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  factValue: {
    flex: 1,
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
  },
  factLink: {
    color: theme.colors.link,
  },
  hint: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textMuted,
  },
  form: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  formTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  fieldLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  error: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
}));
