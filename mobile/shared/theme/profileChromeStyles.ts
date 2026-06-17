import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_CONTENT_PADDING_BOTTOM,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
} from "@/shared/theme/screenContentLayout";

export const PROFILE_CONTENT_MAX_WIDTH = 420;
export const PROFILE_ACTIONS_MAX_WIDTH = 320;
const PROFILE_AVATAR_SIZE = 72;
const PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE * 3;

export const useProfileScreenStyles = createThemedStyles((theme) => ({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[3],
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    backgroundColor: theme.colors.bg,
  },
  bodyCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  guestContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[6],
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
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
  emailBanner: {
    width: "100%",
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.warningSurface,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  emailBannerText: {
    fontSize: 14,
    color: theme.colors.warningText,
    textAlign: "center",
  },
  emailBannerButton: {
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
    marginTop: theme.spacing[6],
    paddingVertical: theme.spacing[2],
  },
  legalLinkText: {
    fontSize: 14,
    textDecorationLine: "underline",
    color: theme.colors.link,
  },
}));

export const useProfileOverviewSectionStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[4],
  },
  raffleSection: {
    marginBottom: theme.spacing[1],
  },
}));

export const useProfileOverviewBannerStyles = createThemedStyles((theme) => ({
  wrap: {
    width: "100%",
  },
  banner: {
    position: "relative",
    minHeight: PROFILE_BANNER_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
  },
  bannerFallback: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  avatarWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    width: PROFILE_AVATAR_SIZE,
    height: PROFILE_AVATAR_SIZE,
    borderRadius: PROFILE_AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surfaceMuted,
    zIndex: 2,
  },
  avatarWrapPremium: {
    borderColor: theme.colors.premium,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
  },
}));

export const useProfileMobileNavToggleStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.actionSurface,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  caption: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: theme.colors.textMuted,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));

export const useProfileMobileNavSheetStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    width: "88%",
    maxWidth: 288,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    shadowColor: theme.colors.nearBlack,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
  sheetContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  logoutFooter: {
    marginTop: theme.spacing[2],
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    gap: theme.spacing[3],
  },
  logoutError: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: "center",
  },
  logoutConfirm: {
    gap: theme.spacing[3],
  },
  logoutQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  logoutActions: {
    gap: theme.spacing[2],
  },
}));

export const useProfileHubMenuStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: PROFILE_CONTENT_MAX_WIDTH,
    marginTop: theme.spacing[5],
    gap: theme.spacing[4],
  },
  rootSheet: {
    marginTop: 0,
    maxWidth: undefined,
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
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  itemActive: {
    borderLeftColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
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
  itemLabelActive: {
    fontWeight: "700",
    color: theme.colors.action,
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
