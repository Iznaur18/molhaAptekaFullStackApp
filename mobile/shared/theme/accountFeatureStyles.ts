import { StyleSheet } from "react-native";

import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useAccountPageChromeStyles = createThemedStyles((theme, layout) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
    backgroundColor: layout.pageBackground,
  },
  hint: {
    fontSize: theme.typography.fontMd,
    textAlign: "center",
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  message: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing[6],
    alignItems: "center",
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  createButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  disabled: {
    opacity: 0.6,
  },
  list: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    flexGrow: 1,
  },
}));

export const useUserFollowButtonStyles = createThemedStyles((theme, layout) => ({
  root: {
    marginTop: 4,
    gap: 4,
  },
  rootInline: {
    marginTop: 0,
    flexShrink: 0,
    alignSelf: "center",
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.action,
    alignItems: "center",
  },
  buttonInline: {
    alignSelf: "center",
  },
  buttonSellerMeta: {
    paddingVertical: L.followPaddingVertical,
    paddingHorizontal: L.followPaddingHorizontal,
    borderRadius: L.followBorderRadius,
    borderWidth: 1,
    borderColor: theme.colors.action,
  },
  buttonFollowing: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
  },
  buttonFollowingSellerMeta: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.action,
  },
  buttonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  buttonTextFollowing: {
    color: theme.colors.textSecondary,
  },
  buttonTextFollowingSellerMeta: {
    color: theme.colors.action,
  },
  error: {
    marginTop: 4,
    fontSize: theme.typography.fontXs,
    color: theme.colors.danger,
  },
}));

export const useUserVoteRatingStyles = createThemedStyles((theme, layout) => ({
  root: {
    marginTop: theme.spacing[4],
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
    paddingHorizontal: 14,
    paddingVertical: theme.spacing[3],
  },
  summaryMain: {
    flex: 1,
    gap: 4,
  },
  summaryText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  summaryMeta: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryAvg: {
    fontSize: theme.typography.font3xl,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  summaryAvgMuted: {
    color: theme.colors.textMuted,
  },
  summaryOutOf: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  summaryVotes: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontXs,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  title: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  aggregateHero: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  aggregateValue: {
    fontSize: 40,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -1,
    lineHeight: 44,
  },
  aggregateMeta: {
    paddingBottom: 6,
    gap: 2,
  },
  aggregateOutOf: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textMuted,
  },
  aggregateVotes: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  rangeLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  scaleEdgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scaleEdgeLabel: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  scoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  scoreChipWrap: {
    width: "18%",
  },
  scoreChip: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreChipText: {
    fontSize: theme.typography.fontXl,
    fontWeight: "800",
  },
  scoreChipSelectedRing: {
    shadowColor: theme.colors.nearBlack,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  hint: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.leadingBase,
  },
  button: {
    alignSelf: "stretch",
    borderRadius: theme.radius.button,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
  },
  ratedCard: {
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: `${theme.colors.success}55`,
    backgroundColor: theme.colors.successSurface,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 6,
  },
  ratedCheck: {
    fontSize: theme.typography.font7xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.success,
    lineHeight: 32,
  },
  ratedTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.successText,
  },
  ratedScore: {
    fontSize: theme.typography.font4xl,
    fontWeight: "800",
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSm,
  },
  flash: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    textAlign: "center",
  },
}));

export const useInstallmentContractCardStyles = createThemedStyles((theme, layout) => ({
  card: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    borderRadius: theme.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing[2],
  },
  product: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  productLink: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.link,
  },
  meta: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  paymentsTitle: {
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  paymentText: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.text,
  },
  paymentDue: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  paymentRow: {
    marginTop: theme.spacing[2],
    gap: theme.spacing[2],
  },
  paymentInfo: {
    gap: 2,
  },
  sellerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  actionButton: {
    marginTop: theme.spacing[2],
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
  },
  actionText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontBase,
  },
  rejectButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  rejectText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontBase,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSm,
  },
}));

export const useLegalPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: layout.pageBackground,
  },
  documentTabBarRoot: {
    marginBottom: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  documentTabBarScrollContent: {
    flexDirection: "row",
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
  },
  documentTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: `${theme.colors.action}59`,
    backgroundColor: theme.colors.surface,
  },
  documentTabActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  documentTabText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.action,
  },
  documentTabTextActive: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  title: {
    fontSize: theme.typography.font4xl,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing[4],
    color: theme.colors.text,
  },
  paragraph: {
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingLg,
    marginBottom: theme.spacing[3],
    color: theme.colors.textSecondary,
  },
  meta: {
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  operator: {
    marginTop: theme.spacing[3],
    fontSize: theme.typography.fontBase,
    color: theme.colors.danger,
    fontStyle: "italic",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  contact: {
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontMd,
    color: theme.colors.textSecondary,
  },
  webLink: {
    marginTop: theme.spacing[4],
    alignSelf: "flex-start",
  },
  webLinkText: {
    fontSize: theme.typography.fontMd,
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  link: {
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
}));

export const useNotificationsPageStyles = createThemedStyles((theme, layout) => ({
  root: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
  toolbar: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  count: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    flex: 1,
    color: theme.colors.textMuted,
  },
  /** web `.notifications-page__clear` pad 0.4/0.85rem, r 0.5rem */
  clearButton: {
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 6.4,
    paddingHorizontal: 13.6,
    borderColor: theme.colors.actionBorder,
    backgroundColor: "transparent",
  },
  clearText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.action,
  },
  errorBanner: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    borderColor: `${theme.colors.danger}47`,
    backgroundColor: theme.colors.dangerSurface,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  errorBannerMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.danger}2e`,
    color: theme.colors.danger,
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: theme.typography.leadingLg,
  },
  errorBannerText: {
    flex: 1,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.dangerText,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
    backgroundColor: layout.pageBackground,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  empty: {
    fontSize: theme.typography.fontMd,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  loginButton: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.action,
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  /** web `.notifications-page__list { gap: 0.5rem }` */
  list: {
    padding: theme.spacing[4],
    gap: 8,
  },
  /** web item-btn pad 0.75×0.85rem, r 0.5rem, action-soft */
  item: {
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 13.6,
    borderColor: theme.colors.infoSoft,
    backgroundColor: theme.colors.actionSoft,
  },
  itemStatic: {
    opacity: 0.85,
  },
  message: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.infoDeep,
  },
  createdAt: {
    marginTop: 6,
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
}));
