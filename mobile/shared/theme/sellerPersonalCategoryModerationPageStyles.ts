import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useSellerPersonalCategoryModerationPageStyles = createThemedStyles((theme, layout) => ({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: layout.pageBackground,
    },
    scroll: {
      paddingHorizontal: layout.contentPaddingHorizontal,
      paddingTop: 12,
      gap: 16,
    },
    header: {
      marginBottom: 4,
    },
    list: {
      gap: 16,
    },
    state: {
      marginBottom: 16,
      fontSize: 15.2,
      lineHeight: theme.typography.leadingLg,
      color: theme.colors.textSecondary,
    },
    stateError: {
      color: theme.colors.danger,
    },
    empty: {
      fontSize: 15.2,
      lineHeight: theme.typography.leadingLg,
      color: theme.colors.textSecondary,
      textAlign: "center",
      paddingVertical: 8,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: layout.contentPaddingHorizontal,
      backgroundColor: layout.pageBackground,
    },
  }),
);
