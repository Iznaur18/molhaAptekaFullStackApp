import { Platform, StyleSheet } from "react-native";

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
/** Высота шапки-баннера профиля. Переиспользуется превью фона в редакторе. */
export const PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE * 3;
export const PROFILE_CARD_SQUIRCLE_RADIUS = 24;
/** Паритет с teaser/wholesale chrome на экране товара. */
export const PRODUCT_DETAIL_SECTION_RADIUS = 20;
const GUEST_BODY_PADDING_TOP = 0;
const GUEST_BODY_MARGIN_TOP = 36;
const GUEST_BODY_MARGIN_BOTTOM = 36;

export const useProfileScreenStyles = createThemedStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  guestSafeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  guestScrollBlock: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  guestScrollContent: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "stretch",
    paddingTop: 12,
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
    flex: 1,
    width: "100%",
    alignItems: "stretch",
    backgroundColor: theme.colors.surface,
  },
  guestInner: {
    alignSelf: "stretch",
    width: "100%",
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  guestHero: {
    width: "100%",
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  guestHeroImage: {
    width: "100%",
    height: "100%",
  },
  guestHeroSkeleton: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surfaceMuted,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  guestBody: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[4],
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: GUEST_BODY_PADDING_TOP,
    marginTop: GUEST_BODY_MARGIN_TOP,
    marginBottom: GUEST_BODY_MARGIN_BOTTOM,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
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
    marginTop: 0,
    width: "100%",
    gap: theme.spacing[3],
  },
  actionButton: {
    width: "100%",
  },
  error: {
    marginTop: theme.spacing[3],
    color: theme.colors.danger,
    textAlign: "center",
  },
  legalLink: {
    marginTop: 0,
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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
}));

const PROFILE_MOBILE_NAV_TOGGLE = {
  borderWidth: 2,
  borderRadius: 16,
  iconSize: 36,
  iconRadius: 10,
  iconBorderWidth: 2,
  paddingVertical: 12,
  paddingHorizontal: 14,
  shadowOpacity: 0.18,
  shadowRadius: 14,
  shadowOffsetY: 4,
  elevation: 3,
  captionSize: 11,
  labelSize: 16,
  letterSpacing: 0.8,
} as const;

export const PROFILE_MOBILE_NAV_TOGGLE_BORDER_RADIUS =
  PROFILE_MOBILE_NAV_TOGGLE.borderRadius;

export const useProfileMobileNavToggleStyles = createThemedStyles((theme) => ({
  outer: {
    alignSelf: "stretch",
  },
  pressable: {
    alignSelf: "stretch",
  },
  root: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: PROFILE_MOBILE_NAV_TOGGLE.paddingVertical,
    paddingHorizontal: PROFILE_MOBILE_NAV_TOGGLE.paddingHorizontal,
    borderWidth: PROFILE_MOBILE_NAV_TOGGLE.borderWidth,
    borderColor: theme.colors.actionHover,
    backgroundColor: theme.colors.action,
  },
  shadow: {
    shadowColor: theme.colors.action,
    shadowOpacity: PROFILE_MOBILE_NAV_TOGGLE.shadowOpacity,
    shadowRadius: PROFILE_MOBILE_NAV_TOGGLE.shadowRadius,
    shadowOffset: { width: 0, height: PROFILE_MOBILE_NAV_TOGGLE.shadowOffsetY },
    elevation: PROFILE_MOBILE_NAV_TOGGLE.elevation,
  },
  iconWrap: {
    width: PROFILE_MOBILE_NAV_TOGGLE.iconSize,
    height: PROFILE_MOBILE_NAV_TOGGLE.iconSize,
    borderRadius: PROFILE_MOBILE_NAV_TOGGLE.iconRadius,
    borderWidth: PROFILE_MOBILE_NAV_TOGGLE.iconBorderWidth,
    borderColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  caption: {
    fontSize: PROFILE_MOBILE_NAV_TOGGLE.captionSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: PROFILE_MOBILE_NAV_TOGGLE.letterSpacing,
    color: theme.colors.onContrast,
  },
  label: {
    fontSize: PROFILE_MOBILE_NAV_TOGGLE.labelSize,
    fontWeight: "700",
    color: theme.colors.onContrast,
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
  rootCentered: {
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  labelCentered: {
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  rowCentered: {
    justifyContent: "center",
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

const USER_PROFILE_THUMB_SIZE = 64;
export const USER_PROFILE_THUMB_SQUIRCLE_RADIUS = 18;
export const USER_PROFILE_THUMB_GAP = 10;
/** До первого onLayout — запасной размер ряда. */
export const USER_PROFILE_THUMB_ROW_SIZE = 5;

export const resolveUserProfileThumbColumns = (contentWidth: number): number => {
  if (contentWidth <= 0) {
    return USER_PROFILE_THUMB_ROW_SIZE;
  }

  return Math.max(
    1,
    Math.floor(
      (contentWidth + USER_PROFILE_THUMB_GAP) /
        (USER_PROFILE_THUMB_SIZE + USER_PROFILE_THUMB_GAP),
    ),
  );
};

export const useUserProfileThumbListStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: theme.spacing[4],
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  rootHorizontal: {
    marginBottom: 0,
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  rootHorizontalRadius: {
    borderRadius: PRODUCT_DETAIL_SECTION_RADIUS,
    overflow: "hidden",
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.ink,
    borderBottomColor: theme.colors.ink,
  },
  headerHorizontal: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: theme.colors.onContrast,
  },
  headerTitleHorizontal: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "none",
    color: theme.colors.text,
  },
  headerTitlePressable: {
    flex: 1,
    minWidth: 0,
  },
  headerAction: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: theme.colors.onContrast,
    opacity: 0.82,
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: theme.spacing[2],
  },
  bodyHorizontal: {
    paddingTop: 4,
    backgroundColor: "transparent",
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
    gap: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridRowPartial: {
    justifyContent: "flex-start",
    gap: USER_PROFILE_THUMB_GAP,
  },
  scrollRow: {
    flexGrow: 0,
  },
  scrollRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: USER_PROFILE_THUMB_GAP,
  },
  thumbButton: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
  },
  thumbButtonUnavailable: {
    opacity: 0.72,
  },
  thumbClip: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surfaceMuted,
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    color: theme.colors.warningText,
  },
  footerAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  footerActionDisabled: {
    opacity: 0.65,
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
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
