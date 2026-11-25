import { StyleSheet } from "react-native";

import { PROFILE_OVERVIEW_LAYOUT as O } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { resolveProfileSectionHeaderChrome } from "@/shared/theme/profileChromeStyles";

export const useUserProfileInfoPanelStyles = createThemedStyles((theme) => {
  const sectionHeader = resolveProfileSectionHeaderChrome(theme);

  return {
    root: {
      gap: O.infoSectionsGap,
    },
    section: {
      borderWidth: 1,
      borderRadius: O.infoSectionRadius,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.66,
      textTransform: "uppercase",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: sectionHeader.backgroundColor,
      color: sectionHeader.color,
      borderBottomColor: sectionHeader.borderBottomColor,
    },
    detailRow: {
      flexDirection: "row",
      flexWrap: "nowrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    detailLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexGrow: 0,
      flexShrink: 1,
      maxWidth: "55%",
      minWidth: 0,
    },
    detailIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: theme.colors.surfaceMuted,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: "600",
      flexShrink: 1,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
      textAlign: "right",
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      color: theme.colors.textSecondary,
    },
    detailValueEmpty: {
      fontWeight: "500",
      color: theme.colors.textMuted,
    },
    detailValueLink: {
      color: theme.colors.link,
      textDecorationLine: "underline",
    },
    revealPhone: {
      color: theme.colors.link,
      fontWeight: "700",
    },
    revealError: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.danger,
      textAlign: "right",
    },
    detailValuePositive: {
      flexGrow: 0,
      flexShrink: 0,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textSecondary,
    },
    detailValueMuted: {
      flexGrow: 0,
      flexShrink: 0,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.textMuted,
    },
    /** web `--stat-grid-gap: 0.625rem`, pad `--user-profile-block-pad` / inline. */
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingVertical: 11.2,
      paddingHorizontal: 14,
    },
    statCard: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "45%",
      maxWidth: "49%",
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 11.2,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceMuted,
    },
    statCardPressed: {
      opacity: 0.88,
    },
    statCardWide: {
      flexBasis: "100%",
      maxWidth: "100%",
      width: "100%",
    },
    statCardWideBody: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statText: {
      flex: 1,
      minWidth: 0,
      gap: 2.4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 15,
      color: theme.colors.textMuted,
    },
    statValue: {
      fontSize: 17,
      fontWeight: "700",
      lineHeight: 20.4,
      color: theme.colors.text,
    },
    statValueEmpty: {
      fontWeight: "500",
      color: theme.colors.textMuted,
      opacity: 0.7,
    },
    statValueWide: {
      flexShrink: 1,
      minWidth: 0,
      fontSize: 15,
      textAlign: "right",
    },
    statChevron: {
      flexShrink: 0,
      opacity: 0.55,
    },
  };
});
