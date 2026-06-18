import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { MEDIA_OVERLAY_SCRIM } from "@/shared/theme/catalogProductStyles";

export const useAppIntroSplashStyles = createThemedStyles((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.ink,
  },
  video: {
    flex: 1,
    width: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[2],
  },
  fallbackTitle: {
    color: theme.colors.onContrast,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  fallbackHint: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  controls: {
    position: "absolute",
    top: 52,
    right: theme.spacing[4],
    gap: theme.spacing[3],
    alignItems: "flex-end",
  },
  controlText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
    textShadowColor: MEDIA_OVERLAY_SCRIM,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  adBadge: {
    position: "absolute",
    top: 52,
    left: theme.spacing[4],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
  },
  adBadgeText: {
    color: theme.colors.onContrast,
    fontSize: 12,
    fontWeight: "700",
  },
}));

export const useSellerFormStyles = createThemedStyles((theme) => ({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  mediaChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  mediaChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  mediaChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  mediaChipTextActive: {
    color: theme.colors.onContrast,
  },
  submit: {
    marginTop: theme.spacing[4],
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  success: {
    color: theme.colors.success,
    fontSize: 14,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  container: {
    padding: theme.spacing[4],
    gap: 10,
    paddingBottom: theme.spacing[8],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  mediaTypeRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 16,
  },
}));

export const useAdvertisingCardStyles = createThemedStyles((theme) => ({
  card: {
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  statusPanel: {
    padding: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  timingHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  primaryButton: {
    paddingVertical: theme.spacing[3],
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: theme.colors.nearBlack,
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: theme.spacing[3],
    borderRadius: 10,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  success: {
    color: theme.colors.success,
    fontSize: 13,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  loading: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  form: {
    gap: 10,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  tariffChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing[3],
  },
  tariffChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  tariffText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  tariffTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useAuctionPageStyles = createThemedStyles((theme) => ({
  list: {
    padding: theme.spacing[4],
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.spacing[3],
    padding: theme.spacing[3],
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.button,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  rowMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  rowPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  accepted: {
    fontSize: 12,
    color: theme.colors.success,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: theme.colors.nearBlack,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 13,
  },
  rejectButton: {
    borderRadius: theme.radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surface,
  },
  rejectButtonText: {
    color: theme.colors.danger,
    fontWeight: "600",
    fontSize: 13,
  },
  bidRow: {
    padding: theme.spacing[3],
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing[2],
    gap: 4,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 16,
    fontWeight: "600",
  },
}));

export const useProductEditorScreenStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    gap: 10,
    paddingBottom: theme.spacing[8],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  imageUrl: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
  },
  success: {
    color: theme.colors.success,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  cancelButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    minHeight: 48,
    backgroundColor: theme.colors.nearBlack,
  },
  submitText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: theme.spacing[2],
    alignItems: "center",
    paddingVertical: 14,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
}));

export const useAdvertisingPageStyles = createThemedStyles((theme) => ({
  container: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  balanceCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 14,
    gap: 4,
    backgroundColor: theme.colors.surface,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  balance: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
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
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 16,
    fontWeight: "600",
  },
}));

export const useMyProductsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  list: {
    padding: 10,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 6,
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  count: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  createButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.nearBlack,
  },
  createButtonText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
  row: {
    justifyContent: "space-between",
  },
  cardWrap: {
    flex: 1,
    margin: 6,
  },
  cardActions: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  cardAction: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));

export const useSellerProductsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  list: {
    padding: theme.spacing[3],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[2],
  },
  header: {
    marginBottom: theme.spacing[3],
    gap: theme.spacing[2],
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  row: {
    justifyContent: "space-between",
  },
  cell: {
    flex: 1,
    padding: 4,
  },
  hint: {
    textAlign: "center",
    marginTop: theme.spacing[6],
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[3],
    backgroundColor: theme.colors.bg,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: 20,
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
  },
}));
