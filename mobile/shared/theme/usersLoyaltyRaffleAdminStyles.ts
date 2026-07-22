import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUsersLoyaltyRaffleAdminStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 15,
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
    fontSize: 15,
    lineHeight: 20,
  },
  error: {
    fontSize: 13,
    color: theme.colors.danger,
  },
  success: {
    fontSize: 13,
    color: theme.colors.success,
  },
}));
