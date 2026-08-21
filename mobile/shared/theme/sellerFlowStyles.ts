import { Platform, StyleSheet } from "react-native";

import { MEDIA_OVERLAY_SCRIM } from "@/shared/theme/catalogProductStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

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
    left: 0,
    right: 0,
    bottom: theme.spacing[8],
    alignItems: "center",
    gap: theme.spacing[3],
  },
  controlText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
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
  editorScreen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    padding: 20,
    paddingBottom: 20,
  },
  content: {
    gap: 16,
  },
  zoneBlock: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderColor: theme.colors.border,
  },
  zoneMain: {
    backgroundColor: theme.colors.surface,
  },
  zoneInventory: {
    backgroundColor: theme.colors.surface,
  },
  zoneMedia: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  contentWithFooterPad: {
    paddingBottom: 168,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  textArea: {
    minHeight: 128,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  imageUrl: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  feedbackBox: {
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  errorBox: {
    borderColor: `${theme.colors.danger}59`,
    backgroundColor: `${theme.colors.danger}12`,
  },
  successBox: {
    borderColor: `${theme.colors.success}40`,
    backgroundColor: `${theme.colors.success}14`,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  success: {
    color: theme.colors.success,
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  returnChoiceRow: {
    flexDirection: "row",
    gap: 10,
  },
  returnChoiceChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  returnChoiceChipText: {
    fontSize: 15,
    fontWeight: "700",
  },
  returnTermBlock: {
    gap: 12,
    marginTop: 4,
  },
  priceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  priceCol: {
    flex: 1,
  },
  priceInput: {
    fontVariant: ["tabular-nums"],
  },
  discountPreview: {
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  discountPreviewText: {
    fontSize: 14,
    fontWeight: "600",
  },
  charRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  charInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  charInputValue: {
    flex: 1.5,
  },
  charRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  charRemoveText: {
    fontSize: 13,
    fontWeight: "700",
  },
  charAddButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  charAddButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 10,
  },
  footerDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: theme.colors.danger,
  },
  submitButton: {
    flex: 1.4,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: theme.colors.action,
    borderColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "700",
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
}));

export const useMyProductsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    flexGrow: 1,
  },
  header: {
    gap: 13.6,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  createButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.action,
  },
  createButtonDisabled: {
    opacity: 0.55,
  },
  createButtonText: {
    color: theme.colors.onContrast,
    fontSize: 14.4,
    fontWeight: "600",
  },
  banner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13.5,
    lineHeight: 19,
  },
  noticeBanner: {
    backgroundColor: theme.colors.actionSurface,
    color: theme.colors.infoNavy,
  },
  errorBanner: {
    backgroundColor: `${theme.colors.danger}14`,
    color: theme.colors.danger,
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
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
}));

export const useSellerProductsPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[3],
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing[3],
    gap: theme.spacing[2],
  },
  sellerMetaZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.actionSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  sellerMetaName: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  sellerMetaActions: {
    flexDirection: "row",
    flexShrink: 0,
    alignItems: "center",
    gap: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
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
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: 15,
    fontWeight: "600",
  },
}));

export const useInstallmentProgramModalStyles = createThemedStyles((theme) => ({
  embeddedRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  header: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    lineHeight: 24,
    color: theme.colors.textMuted,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyScroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.danger,
  },
  success: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.success,
  },
  info: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  retailPrice: {
    color: theme.colors.action,
    fontWeight: "600",
  },
  planCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    overflow: "hidden",
  },
  planCardLast: {
    marginBottom: 0,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.actionHover,
    backgroundColor: theme.colors.action,
  },
  planTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: theme.colors.onContrast,
  },
  planRemoveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  planRemove: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  planBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: theme.colors.surfaceElevated,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  rowFields: {
    flexDirection: "row",
    gap: 10,
  },
  rowField: {
    flex: 1,
    gap: 6,
  },
  planTotalBlock: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  planTotalMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  planTotalMain: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  firstPaymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  firstPaymentLabel: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  addPlanButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  addPlanButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.link,
  },
  maxPlansHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));
