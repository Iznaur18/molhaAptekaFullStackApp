import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const SELFIE_MAX_WIDTH = 288;
const SELFIE_MAX_HEIGHT = 224;

export const useDataConfirmationRequestsPageStyles = createThemedStyles(
  (theme, layout) => ({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: layout.pageBackground,
    },
    scroll: {
      paddingHorizontal: layout.contentPaddingHorizontal,
      paddingTop: 12,
      gap: 12,
    },
    header: {
      marginBottom: 4,
    },
    list: {
      gap: 12,
    },
    state: {
      fontSize: 15.2,
      lineHeight: theme.typography.leadingLg,
      color: theme.colors.textSecondary,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: layout.contentPaddingHorizontal,
      backgroundColor: layout.pageBackground,
    },
    card: {
      gap: 8,
      padding: 12,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    cardHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    cardMeta: {
      fontSize: theme.typography.fontSm,
      color: theme.colors.textSecondary,
    },
    applicantLink: {
      alignSelf: "flex-start",
    },
    applicantLinkText: {
      fontSize: theme.typography.fontBase,
      color: theme.colors.link,
      textDecorationLine: "underline",
    },
    sectionTitle: {
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightSemibold,
      color: theme.colors.text,
    },
    passportGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    passportField: {
      width: "47%",
      minWidth: 140,
      gap: 2,
    },
    passportLabel: {
      fontSize: theme.typography.font2xs,
      color: theme.colors.textSecondary,
    },
    passportValue: {
      fontSize: theme.typography.fontBase,
      lineHeight: theme.typography.leadingBase,
      color: theme.colors.text,
    },
    selfieSection: {
      gap: 8,
    },
    selfieLink: {
      gap: 6,
      alignSelf: "flex-start",
    },
    selfieImage: {
      width: "100%",
      maxWidth: SELFIE_MAX_WIDTH,
      height: SELFIE_MAX_HEIGHT,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
    },
    selfieOpenText: {
      fontSize: theme.typography.fontSm,
      color: theme.colors.link,
      textDecorationLine: "underline",
    },
    selfieMissing: {
      fontSize: theme.typography.fontSm,
      color: theme.colors.textSecondary,
    },
    staffLabel: {
      gap: 4,
      fontSize: theme.typography.fontSm,
      color: theme.colors.textSecondary,
    },
    staffInput: {
      minHeight: 56,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: theme.typography.fontMd,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      textAlignVertical: "top",
    },
    rowError: {
      fontSize: theme.typography.fontSm,
      lineHeight: theme.typography.leadingSm,
      color: theme.colors.danger,
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    actionPrimary: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.link,
    },
    actionReject: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    actionDisabled: {
      opacity: 0.65,
    },
    actionPrimaryText: {
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.colors.onContrast,
    },
    actionRejectText: {
      fontSize: theme.typography.fontBase,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.colors.warningText,
    },
  }),
);
