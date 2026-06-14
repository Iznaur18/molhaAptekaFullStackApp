import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useMediaUploadFieldStyles = createThemedStyles((theme) => ({
  wrap: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  preview: {
    width: "100%",
    height: 140,
    borderRadius: 10,
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
    borderColor: theme.colors.nearBlack,
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
    color: theme.colors.nearBlack,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
}));

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
