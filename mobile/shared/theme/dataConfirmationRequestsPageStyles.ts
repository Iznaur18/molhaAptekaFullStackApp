import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const SELFIE_MAX_WIDTH = 288;
const SELFIE_MAX_HEIGHT = 224;

export const useDataConfirmationRequestsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
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
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
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
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  applicantLink: {
    alignSelf: "flex-start",
  },
  applicantLinkText: {
    fontSize: 14,
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  passportValue: {
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 13,
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
  selfieMissing: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  staffLabel: {
    gap: 4,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  staffInput: {
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
  },
  rowError: {
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  actionRejectText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.warningText,
  },
}));
