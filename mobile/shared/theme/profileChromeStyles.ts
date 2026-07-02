import { StyleSheet } from "react-native";

import { PROFILE_CONTENT_MAX_WIDTH_PHONE } from "@/shared/lib/screenBreakpoints";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_CONTENT_PADDING_BOTTOM,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
} from "@/shared/theme/screenContentLayout";

/** @deprecated используйте resolveProfileContentMaxWidth / useScreenLayout */
export const PROFILE_CONTENT_MAX_WIDTH = PROFILE_CONTENT_MAX_WIDTH_PHONE;
export const PROFILE_ACTIONS_MAX_WIDTH = 320;
const PROFILE_AVATAR_SIZE = 72;
const PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE * 3;

export const useProfileScreenStyles = createThemedStyles((theme) => ({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[3],
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: theme.spacing[3],
    backgroundColor: theme.colors.bg,
  },
  bodyCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: 7,
    gap: theme.spacing[3],
    shadowColor: theme.colors.nearBlack,
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
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
  avatarWrapPremium: {
    borderColor: theme.colors.premium,
  },
  avatarOnBanner: {
    position: "absolute",
    top: 12,
    left: 12,
    width: PROFILE_AVATAR_SIZE,
    height: PROFILE_AVATAR_SIZE,
    zIndex: 2,
    borderWidth: 2,
    borderColor: theme.colors.surface,
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
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const useProfileMobileNavToggleStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.actionSurface,
    shadowColor: theme.colors.action,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
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
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.primaryBright,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary,
  },
}));

export const PROFILE_MOBILE_NAV_SHEET_ANIMATION = {
  enterMs: 280,
  exitMs: 240,
  slideDistance: 320,
} as const;

export const useProfileMobileNavSheetStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.48)",
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
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: -12, height: 0 },
    elevation: 12,
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
    marginTop: theme.spacing[5],
    gap: theme.spacing[2],
  },
  rootSheet: {
    marginTop: 0,
    maxWidth: undefined,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
    color: theme.colors.primary,
  },
  group: {
    gap: 2,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  groupDivided: {
    marginTop: theme.spacing[1],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: theme.spacing[2],
    paddingHorizontal: 9,
    color: theme.colors.primaryBright,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 7,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  itemIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemDisabled: {
    opacity: 0.45,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textSecondary,
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

const USER_PROFILE_THUMB_SIZE = 48;

export const useUserProfileThumbListStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: theme.spacing[4],
    paddingVertical: 12,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  headingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  heading: {
    fontSize: 15.2,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  headingAction: {
    textDecorationLine: "underline",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  state: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  stateError: {
    color: theme.colors.danger,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  thumbButton: {
    borderRadius: 6,
    overflow: "hidden",
  },
  thumbButtonUnavailable: {
    opacity: 0.72,
  },
  thumb: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  thumbPlaceholder: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  hint: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    textAlign: "center",
    color: theme.colors.warningText,
  },
  moreButton: {
    alignSelf: "center",
    marginTop: theme.spacing[2],
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceMuted,
  },
  moreButtonText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  moreButtonDisabled: {
    opacity: 0.65,
  },
}));

export const useUserDetailsPageStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[3],
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: theme.spacing[2],
  },
  header: {
    gap: theme.spacing[2],
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  titleName: {
    flex: 1,
    minWidth: 0,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  profileBody: {
    gap: theme.spacing[2],
  },
  footer: {
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
}));
