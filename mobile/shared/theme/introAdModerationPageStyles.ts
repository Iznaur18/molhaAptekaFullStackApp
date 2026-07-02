import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const DANGER_STRONG = "#b42318";
const NEUTRAL_GRAY_DEEP = "#4b5563";

export const useIntroAdModerationPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  sectionBadge: {
    minWidth: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  list: {
    gap: 16,
  },
  state: {
    marginBottom: 16,
    fontSize: 15.2,
    lineHeight: 22,
    color: NEUTRAL_GRAY_DEEP,
  },
  stateError: {
    color: DANGER_STRONG,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: NEUTRAL_GRAY_DEEP,
    textAlign: "center",
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
}));
