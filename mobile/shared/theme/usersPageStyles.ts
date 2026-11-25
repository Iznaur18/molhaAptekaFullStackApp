import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUsersPageStyles = createThemedStyles((theme, layout) => ({
  screen: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
  searchBar: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    flexGrow: 1,
  },
  cell: {
    flex: 1,
  },
  listFlex: {
    flex: 1,
  },
  stateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    gap: 14,
    paddingHorizontal: layout.contentPaddingHorizontal,
    marginTop: 24,
  },
  state: {
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: layout.contentPaddingHorizontal,
    fontSize: theme.typography.fontMd,
    color: theme.colors.textMuted,
  },
  stateError: {
    color: theme.colors.danger,
  },
}));
