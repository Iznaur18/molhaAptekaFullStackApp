import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCancelButtonStyles = createThemedStyles((theme) => ({
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonFlex: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 15.2,
  },
  cancelButtonTextCompact: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButtonDisabled: {
    opacity: 0.55,
  },
}));

/** Inline merge helper for themed style sheets. */
export const cancelButtonStyleBlock = (theme: {
  colors: { danger: string; onContrast: string };
}) => ({
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.danger,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cancelButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600" as const,
    fontSize: 15.2,
  },
  cancelButtonDisabled: {
    opacity: 0.55,
  },
});
