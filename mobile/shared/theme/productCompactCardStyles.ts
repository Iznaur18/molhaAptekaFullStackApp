import { StyleSheet } from "react-native";

import { resolveProductCardBadgeColors } from "@/entities/product/lib/productCardBadgePalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const THUMB_SIZE = 88;
const THUMB_RADIUS = 10;

export const useProductCompactCardStyles = createThemedStyles((theme) => {
  const BC = resolveProductCardBadgeColors(theme.colors);
  return {
  card: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  topRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    position: "relative",
  },
  thumbWrapPending: {
    opacity: 0.72,
  },
  thumbPressable: {
    width: "100%",
    height: "100%",
  },
  thumbPressed: {
    opacity: 0.92,
  },
  mediaCounter: {
    position: "absolute",
    right: 4,
    bottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
    color: theme.colors.onContrast,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    overflow: "hidden",
  },
  thumbNav: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  thumbNavHit: {
    width: 22,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbNavText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
    color: theme.colors.onContrast,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summary: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  statusRowScroll: {
    alignSelf: "stretch",
    maxWidth: "100%",
    flexGrow: 0,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 4,
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.warningSurface,
  },
  statusPillPending: {
    backgroundColor: theme.colors.warningSurface,
  },
  statusPillApproved: {
    backgroundColor: `${theme.colors.success}1A`,
  },
  statusPillRejected: {
    backgroundColor: `${theme.colors.danger}14`,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    color: theme.colors.warningText,
  },
  statusPillTextApproved: {
    color: theme.colors.success,
  },
  statusPillTextRejected: {
    color: theme.colors.danger,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  discountPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: `${theme.colors.danger}14`,
  },
  discountPillText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    color: theme.colors.danger,
  },
  promotionPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  promotionPillBoost: {
    backgroundColor: BC.promotionBoostBg,
  },
  promotionPillTop: {
    backgroundColor: BC.promotionTopBg,
  },
  promotionPillBanner: {
    backgroundColor: BC.promotionBannerBg,
  },
  promotionPillText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  promotionPillTextBoost: {
    color: BC.promotionBoostText,
  },
  promotionPillTextTop: {
    color: BC.promotionTopText,
  },
  promotionPillTextBanner: {
    color: BC.promotionBannerText,
  },
  featurePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  featurePillAuction: {
    backgroundColor: BC.auctionBg,
  },
  featurePillTextAuction: {
    color: BC.auctionText,
  },
  featurePillInstallment: {
    backgroundColor: BC.installmentBg,
  },
  featurePillTextInstallment: {
    color: BC.installmentText,
  },
  featurePillRaffle: {
    backgroundColor: BC.raffleBg,
  },
  featurePillTextRaffle: {
    color: BC.raffleText,
  },
  featurePillHidden: {
    backgroundColor: BC.hiddenBg,
  },
  featurePillTextHidden: {
    color: BC.hiddenText,
  },
  featurePillLoyaltyOvercommit: {
    backgroundColor: BC.discountBg,
  },
  featurePillTextLoyaltyOvercommit: {
    color: BC.discountText,
  },
  loyaltyPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: `${theme.colors.action}14`,
  },
  loyaltyPillText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    color: theme.colors.action,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  metaMuted: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  metaHint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textSecondary,
  },
  rejectionComment: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.danger,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  };
});

/** @deprecated use useProductCompactCardStyles */
export const useProductModerationQueueCardStyles = useProductCompactCardStyles;
