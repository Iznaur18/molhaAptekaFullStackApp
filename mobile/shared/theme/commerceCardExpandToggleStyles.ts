import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCommerceCardExpandToggleStyles = createThemedStyles((theme) => ({
  button: {
    flexShrink: 0,
    paddingVertical: 2,
  },
  label: {
    fontSize: theme.typography.font2xs,
    lineHeight: 14,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textMuted,
  },
}));
