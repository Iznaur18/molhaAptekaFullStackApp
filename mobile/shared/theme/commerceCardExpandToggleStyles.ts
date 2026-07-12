import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCommerceCardExpandToggleStyles = createThemedStyles((theme) => ({
  button: {
    flexShrink: 0,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
}));
