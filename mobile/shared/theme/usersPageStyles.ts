import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_CONTENT_PADDING_BOTTOM,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
} from "@/shared/theme/screenContentLayout";

export const useUsersPageStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  searchBar: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 10,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    flexGrow: 1,
  },
  cell: {
    flex: 1,
  },
  listFlex: {
    flex: 1,
  },
  state: {
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  stateError: {
    color: theme.colors.danger,
  },
}));
