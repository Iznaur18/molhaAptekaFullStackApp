import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUsersLoyaltyRaffleAdminStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.typography.fontMd,
  },
  textarea: {
    minHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingBase,
  },
  error: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
  success: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.success,
  },
}));
