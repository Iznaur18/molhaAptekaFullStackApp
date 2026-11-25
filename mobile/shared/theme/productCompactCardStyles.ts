import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import { resolveProductCardBadgeColors } from "@/entities/product/lib/productCardBadgePalette";
import {
  PRODUCT_COMPACT_CARD_LAYOUT as L,
  resolveProductCompactCardThumbSize,
} from "@/entities/product/lib/productCompactCardLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const useProductCompactCardBaseStyles = createThemedStyles((theme) => {
  const BC = resolveProductCardBadgeColors(theme.colors);
  return {
    card: {
      gap: L.cardGap,
      paddingVertical: L.paddingVertical,
      paddingHorizontal: L.paddingHorizontal,
      borderRadius: L.cardRadius,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    topRow: {
      flexDirection: "row",
      gap: L.topRowGap,
      alignItems: "flex-start",
    },
    thumbWrap: {
      width: L.thumbSize,
      height: L.thumbSize,
      borderRadius: L.thumbRadius,
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
      fontWeight: theme.typography.fontWeightBold,
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
      fontSize: theme.typography.fontLg,
      fontWeight: theme.typography.fontWeightBold,
      lineHeight: theme.typography.leadingSm,
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
      fontSize: theme.typography.font2xs,
      fontWeight: theme.typography.fontWeightSemibold,
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
      fontSize: theme.typography.fontMd,
      fontWeight: theme.typography.fontWeightSemibold,
      lineHeight: theme.typography.leadingBase,
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
      fontSize: theme.typography.font2xs,
      fontWeight: theme.typography.fontWeightSemibold,
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
      fontSize: theme.typography.font2xs,
      fontWeight: theme.typography.fontWeightSemibold,
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
      fontSize: theme.typography.font2xs,
      fontWeight: theme.typography.fontWeightSemibold,
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
    featurePillWholesale: {
      backgroundColor: BC.wholesaleBg,
    },
    featurePillTextWholesale: {
      color: BC.wholesaleText,
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
      fontSize: theme.typography.font2xs,
      fontWeight: theme.typography.fontWeightSemibold,
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
      fontSize: theme.typography.fontXs,
      lineHeight: theme.typography.leading2xs,
      color: theme.colors.textMuted,
    },
    metaHint: {
      fontSize: theme.typography.fontXs,
      lineHeight: theme.typography.leading2xs,
      color: theme.colors.textSecondary,
    },
    rejectionComment: {
      fontSize: theme.typography.fontXs,
      lineHeight: theme.typography.leading2xs,
      color: theme.colors.danger,
    },
    description: {
      fontSize: theme.typography.fontSm,
      lineHeight: theme.typography.leadingSm,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  };
});

/** Паритет web `.product-card--list`: thumb 112 / 96@≤640. */
export const useProductCompactCardStyles = () => {
  const base = useProductCompactCardBaseStyles();
  const { width } = useWindowDimensions();
  const thumbSize = resolveProductCompactCardThumbSize(width);

  return useMemo(() => {
    if (thumbSize === L.thumbSize) {
      return base;
    }
    return {
      ...base,
      thumbWrap: {
        ...base.thumbWrap,
        width: thumbSize,
        height: thumbSize,
      },
    };
  }, [base, thumbSize]);
};

/** @deprecated use useProductCompactCardStyles */
export const useProductModerationQueueCardStyles = useProductCompactCardStyles;
