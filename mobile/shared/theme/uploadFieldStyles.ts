import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const PRODUCT_PHOTO_GRID_COLUMNS = 3;
export const PRODUCT_PHOTO_GRID_GAP = 8;

export const useMediaUploadFieldStyles = createThemedStyles((theme) => ({
  wrap: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  previewWrap: {
    width: "100%",
    alignItems: "center",
  },
  preview: {
    width: "100%",
    maxWidth: 280,
    height: 160,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
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
  button: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  dangerButton: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  fieldHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
}));

export const useProductPhotoGridStyles = createThemedStyles((theme) => ({
  wrap: {
    gap: theme.spacing[2],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: PRODUCT_PHOTO_GRID_GAP,
  },
  tile: {
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    flexShrink: 0,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 3,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  coverBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  removeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
    color: "#ffffff",
  },
  uploadingTile: {
    alignItems: "center",
    justifyContent: "center",
  },
  addTile: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  addTilePressed: {
    backgroundColor: theme.colors.actionSurface,
    borderColor: theme.colors.action,
  },
  addTileDisabled: {
    opacity: 0.5,
  },
  addTileLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    color: theme.colors.action,
  },
  counter: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  error: {
    fontSize: 13,
    color: theme.colors.danger,
  },
}));

/** Совпадает с --iz-color-warning-amber в designTokens.css */
export const PRODUCT_DETAIL_DOCK_WARNING_AMBER = "#eab308";

export const useAddToCartButtonStyles = createThemedStyles((theme) => ({
  addButton: {
    marginTop: theme.spacing[4],
    backgroundColor: theme.colors.nearBlack,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  addButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15,
  },
  detailDockAddButton: {
    marginTop: 0,
    width: "100%",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 11.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  detailDockAddButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 16.3,
  },
  detailDockLoginButton: {
    marginTop: 0,
    width: "100%",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 11.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  detailDockLoginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 16.3,
  },
  detailDockStepper: {
    marginTop: 0,
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 11.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  detailDockStepButton: {
    width: 28,
    height: 28,
    borderRadius: 5.6,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailDockStepButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.action,
    lineHeight: 18,
  },
  detailDockQuantity: {
    fontSize: 15.2,
    fontWeight: "600",
    minWidth: 22,
    textAlign: "center",
    color: theme.colors.text,
  },
  loginButton: {
    marginTop: theme.spacing[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.nearBlack,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  loginButtonText: {
    color: theme.colors.nearBlack,
    fontWeight: "600",
    fontSize: 15,
  },
  stepButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
    color: theme.colors.text,
  },
  stepper: {
    marginTop: theme.spacing[4],
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: theme.spacing[3],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
}));

export const useProfileAvatarUploadStyles = createThemedStyles((theme) => ({
  wrap: {
    marginTop: theme.spacing[2],
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  avatarWrap: {
    marginTop: theme.spacing[3],
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  button: {
    marginTop: theme.spacing[3],
    paddingVertical: 10,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.nearBlack,
    minWidth: 160,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.nearBlack,
  },
  hint: {
    marginTop: theme.spacing[2],
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  error: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    color: theme.colors.danger,
    textAlign: "center",
  },
}));
