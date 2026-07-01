import { StyleSheet } from "react-native";

import { RAFFLE_FEATURED_PALETTE } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { MODAL_BACKDROP_SCRIM } from "@/shared/theme/formChromeStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const DANGER_DEEP = "#b42318";

export const useCreateRafflePageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    marginBottom: 4,
  },
  form: {
    gap: 12,
  },
  field: {
    gap: 5.6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  fieldHint: {
    fontSize: 12.48,
    lineHeight: 17.5,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 8.8,
    paddingVertical: 7.2,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  mediaType: {
    gap: 8,
  },
  mediaTypeLegend: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  mediaTypeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  mediaTypeOptionActive: {
    opacity: 1,
  },
  mediaTypeOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  mediaTypeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaTypeDotActive: {
    borderColor: RAFFLE_FEATURED_PALETTE.accentPurple,
  },
  mediaTypeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RAFFLE_FEATURED_PALETTE.accentPurple,
  },
  preview: {
    gap: 5.6,
  },
  previewLabel: {
    fontSize: 12.8,
    color: theme.colors.textMuted,
  },
  previewFrame: {
    height: 144,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  pageHint: {
    fontSize: 12.8,
    lineHeight: 17.9,
    color: theme.colors.textMuted,
  },
  error: {
    fontSize: 13.6,
    lineHeight: 19.5,
    color: DANGER_DEEP,
  },
  success: {
    fontSize: 13.6,
    lineHeight: 19.5,
    color: theme.colors.success,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  submit: {
    paddingVertical: 7.2,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RAFFLE_FEATURED_PALETTE.accentPurple,
    backgroundColor: RAFFLE_FEATURED_PALETTE.accentPurpleSoft,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: RAFFLE_FEATURED_PALETTE.accentPurpleText,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
  state: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  hint: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  loginButton: {
    alignSelf: "stretch",
    minHeight: 40.8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10.4,
    backgroundColor: theme.colors.link,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14.4,
  },
}));

export const useCreateRaffleModalStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: MODAL_BACKDROP_SCRIM,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 448,
    maxHeight: "92%",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeText: {
    fontSize: 28,
    lineHeight: 28,
    color: theme.colors.textMuted,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
}));
