import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useAccountPageChromeStyles = createThemedStyles((theme) => ({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
    backgroundColor: theme.colors.bg,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  message: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
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

export const useUserFollowButtonStyles = createThemedStyles((theme) => ({
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
  buttonFollowing: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  buttonTextFollowing: {
    color: theme.colors.textSecondary,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.danger,
  },
}));

export const useUserVoteRatingStyles = createThemedStyles((theme) => ({
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
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  summaryMeta: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 6,
  },
  summaryAvg: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  summaryAvgMuted: {
    color: theme.colors.textMuted,
  },
  summaryOutOf: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  summaryVotes: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  aggregateVotes: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  scaleEdgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scaleEdgeLabel: {
    fontSize: 12,
    fontWeight: "600",
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
    fontSize: 17,
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
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
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
    fontSize: 15,
    fontWeight: "700",
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
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.success,
    lineHeight: 32,
  },
  ratedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.successText,
  },
  ratedScore: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  flash: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
}));

export const useInstallmentContractCardStyles = createThemedStyles((theme) => ({
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
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  productLink: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.link,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  paymentsTitle: {
    marginTop: theme.spacing[1],
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  paymentText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  paymentDue: {
    fontSize: 12,
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
    fontWeight: "600",
    fontSize: 14,
  },
  rejectButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  rejectText: {
    color: theme.colors.danger,
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
}));

export const useLegalPageStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
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
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
  },
  documentTabTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: theme.spacing[4],
    color: theme.colors.text,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing[3],
    color: theme.colors.textSecondary,
  },
  meta: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  operator: {
    marginTop: theme.spacing[3],
    fontSize: 14,
    color: theme.colors.danger,
    fontStyle: "italic",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  contact: {
    marginTop: theme.spacing[6],
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  webLink: {
    marginTop: theme.spacing[4],
    alignSelf: "flex-start",
  },
  webLinkText: {
    fontSize: 15,
    color: theme.colors.link,
    fontWeight: "600",
  },
  link: {
    color: theme.colors.link,
    fontWeight: "600",
  },
}));

export const useNotificationsPageStyles = createThemedStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
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
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    color: theme.colors.textMuted,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    borderColor: theme.colors.borderStrong,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.action,
  },
  error: {
    paddingHorizontal: theme.spacing[4],
    fontSize: 14,
    color: theme.colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
    backgroundColor: theme.colors.bg,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  empty: {
    fontSize: 15,
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
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: theme.spacing[4],
    gap: 10,
  },
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  itemStatic: {
    opacity: 0.85,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
  },
  createdAt: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));
