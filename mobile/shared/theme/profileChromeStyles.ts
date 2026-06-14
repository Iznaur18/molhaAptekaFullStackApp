import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const PROFILE_CONTENT_MAX_WIDTH = 420;
export const PROFILE_ACTIONS_MAX_WIDTH = 320;

export const useProfileScreenStyles = createThemedStyles((theme) => ({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing[3],
    fontSize: 16,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  banner: {
    marginTop: theme.spacing[5],
    width: "100%",
    maxWidth: 360,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.warningSurface,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  bannerText: {
    fontSize: 14,
    color: theme.colors.warningText,
    textAlign: "center",
  },
  bannerButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  actions: {
    marginTop: theme.spacing[6],
    width: "100%",
    maxWidth: PROFILE_ACTIONS_MAX_WIDTH,
    gap: theme.spacing[3],
  },
  actionButton: {
    minWidth: 200,
  },
  error: {
    marginTop: theme.spacing[3],
    color: theme.colors.danger,
    textAlign: "center",
  },
  legalLink: {
    marginTop: theme.spacing[8],
    paddingVertical: theme.spacing[2],
  },
  legalLinkText: {
    fontSize: 14,
    textDecorationLine: "underline",
    color: theme.colors.link,
  },
}));

export const useProfileHubMenuStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: PROFILE_CONTENT_MAX_WIDTH,
    marginTop: theme.spacing[5],
    gap: theme.spacing[4],
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text,
  },
  group: {
    gap: theme.spacing[2],
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
    color: theme.colors.textMuted,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: 14,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemCta: {
    backgroundColor: theme.colors.action,
  },
  itemDisabled: {
    opacity: 0.45,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },
  itemLabelCta: {
    color: theme.colors.onContrast,
  },
  itemLabelDisabled: {
    opacity: 0.45,
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.button,
    alignItems: "center",
    backgroundColor: theme.colors.danger,
  },
  badgeText: {
    color: theme.colors.onContrast,
    fontSize: 12,
    fontWeight: "700",
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.warning,
  },
}));

export const useThemePreferenceToggleStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: PROFILE_CONTENT_MAX_WIDTH,
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  chip: {
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: theme.colors.action,
    borderColor: theme.colors.action,
  },
  chipIdle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: theme.colors.onContrast,
  },
  chipTextIdle: {
    color: theme.colors.text,
  },
}));
