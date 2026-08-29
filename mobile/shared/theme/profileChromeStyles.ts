import { Platform, StyleSheet } from "react-native";

import {
  GUEST_PROFILE_LAYOUT as G,
  MY_PROFILE_LAYOUT_GAP,
  MY_PROFILE_SHELL_PAD_X,
  MY_PROFILE_SIDEBAR_LAYOUT as S,
  MY_PROFILE_SIDEBAR_WIDTH,
  PROFILE_OVERVIEW_LAYOUT as O,
} from "@/shared/lib/guestProfileLayout";
import { PRODUCT_DETAILS_SELLER_PRODUCTS_CAROUSEL_LAYOUT as SPC } from "@/entities/product/lib/productDetailsSellerProductsCarouselLayout";
import { PROFILE_CONTENT_MAX_WIDTH_PHONE } from "@/shared/lib/screenBreakpoints";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_PADDING_BOTTOM, SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

/** @deprecated используйте resolveProfileContentMaxWidth / useScreenLayout */
export const PROFILE_CONTENT_MAX_WIDTH = PROFILE_CONTENT_MAX_WIDTH_PHONE;
export const PROFILE_ACTIONS_MAX_WIDTH = 320;
/** `--modal-avatar-lead-size: 4.5rem` */
const PROFILE_AVATAR_SIZE = 72;
/**
 * Паритет web `--modal-profile-banner-height-mult: 3`
 * → `min-height: calc(4.5rem * 3)` = 216px.
 */
export const PROFILE_BANNER_HEIGHT = PROFILE_AVATAR_SIZE * 3;
/** `--modal-profile-banner-radius: 24px` (обычный radius, не squircle). */
export const PROFILE_BANNER_RADIUS = 24;
/**
 * web banner `margin-bottom: 1rem` схлопывается с share `margin-top`.
 * На RN отступ после баннера — только `PROFILE_OVERVIEW_LAYOUT.shareRowMarginTop`.
 */
export const PROFILE_BANNER_MARGIN_BOTTOM = 0;
/** Карточки info/share — тот же 24, что и web surface. */
export const PROFILE_CARD_SQUIRCLE_RADIUS = 24;
/** Паритет с teaser/wholesale chrome на экране товара. */
export const PRODUCT_DETAIL_SECTION_RADIUS = 20;

export const useProfileScreenStyles = createThemedStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  pageLayout: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    gap: MY_PROFILE_LAYOUT_GAP,
    backgroundColor: theme.colors.bg,
  },
  pageScrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  shellPad: {
    paddingHorizontal: MY_PROFILE_SHELL_PAD_X,
  },
  sidebarWrap: {
    width: MY_PROFILE_SIDEBAR_WIDTH,
    flexShrink: 0,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: S.radius,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  sidebarInner: {
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 0,
    gap: 0,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    backgroundColor: theme.colors.bg,
  },
  /** Контент колонки overview: gap как web `__main { gap: 0.75rem }` между siblings. */
  mainColumnContent: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "stretch",
    paddingTop: O.scrollPaddingTop,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: O.mainGap,
    backgroundColor: theme.colors.bg,
  },
  guestSafeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  guestScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  guestColumn: {
    width: "100%",
    maxWidth: G.columnMaxWidth,
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "stretch",
    paddingTop: O.scrollPaddingTop,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: O.mainGap,
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
  guestHero: {
    width: "100%",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: G.heroRadius,
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
  },
  guestBody: {
    alignItems: "center",
    width: "100%",
    gap: G.bodyGap,
    paddingHorizontal: G.bodyPadX,
    marginTop: G.bodyMarginY,
    marginBottom: G.bodyMarginY,
  },
  title: {
    fontSize: G.titleFontSize,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: G.subtitleFontSize,
    lineHeight: Math.round(G.subtitleFontSize * 1.35),
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
    gap: G.bodyGap,
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
    paddingVertical: G.legalPaddingY,
  },
  legalLinkText: {
    fontSize: G.legalFontSize,
    textDecorationLine: "underline",
    color: theme.colors.link,
  },
  overviewFooter: {
    marginTop: O.footerMarginTop,
    gap: O.footerGap,
  },
}));

export const useProfileOverviewSectionStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    gap: 0,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: O.shareRowGap,
    marginTop: O.shareRowMarginTop,
    width: "100%",
  },
  notificationsBtn: {
    flex: 1,
    height: O.notificationsBtnHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: "transparent",
  },
  shareHalfBtn: {
    flex: 1,
    width: "auto" as const,
    alignSelf: "stretch",
  },
  infoPanel: {
    marginTop: O.infoMarginTop,
    width: "100%",
  },
  raffleSection: {
    marginBottom: theme.spacing[1],
  },
}));

export const useProfileOverviewBannerStyles = createThemedStyles((theme) => ({
  wrap: {
    width: "100%",
    marginBottom: PROFILE_BANNER_MARGIN_BOTTOM,
  },
  banner: {
    position: "relative",
    width: "100%",
    height: PROFILE_BANNER_HEIGHT,
    minHeight: PROFILE_BANNER_HEIGHT,
    borderRadius: PROFILE_BANNER_RADIUS,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  bannerFallback: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: PROFILE_BANNER_RADIUS,
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
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerActions: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
}));

const PROFILE_MOBILE_NAV_TOGGLE = {
  borderWidth: O.sectionToggleBorderWidth,
  borderRadius: O.sectionToggleRadius,
  iconSize: O.sectionToggleIconSize,
  iconRadius: O.sectionToggleIconRadius,
  iconBorderWidth: O.sectionToggleBorderWidth,
  paddingVertical: O.sectionTogglePaddingY,
  paddingHorizontal: O.sectionTogglePaddingX,
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
  rootTablet: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  shadow: {
    shadowColor: theme.colors.action,
    shadowOpacity: PROFILE_MOBILE_NAV_TOGGLE.shadowOpacity,
    shadowRadius: PROFILE_MOBILE_NAV_TOGGLE.shadowRadius,
    shadowOffset: { width: 0, height: PROFILE_MOBILE_NAV_TOGGLE.shadowOffsetY },
    elevation: PROFILE_MOBILE_NAV_TOGGLE.elevation,
  },
  shadowTablet: {
    shadowColor: theme.colors.nearBlack,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
  iconWrapTablet: {
    backgroundColor: theme.colors.actionSoft,
    borderWidth: 0,
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
  captionTablet: {
    color: theme.colors.action,
  },
  label: {
    fontSize: PROFILE_MOBILE_NAV_TOGGLE.labelSize,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  labelTablet: {
    color: theme.colors.primary,
    fontSize: 15,
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
  sheetFromLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowOffset: { width: 12, height: 0 },
  },
  sheetContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  logoutFooter: {
    marginTop: S.groupMarginTop,
    marginHorizontal: S.navPaddingX,
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
  rootSidebar: {
    marginTop: 0,
    maxWidth: undefined,
    // web: head и nav стык в стык (без flex-gap между ними)
    gap: 0,
  },
  sidebarHead: {
    paddingTop: S.headPaddingTop,
    paddingHorizontal: S.headPaddingX,
    paddingBottom: S.headPaddingBottom,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarNav: {
    paddingVertical: S.navPaddingY,
    paddingHorizontal: S.navPaddingX,
    gap: S.navGap,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
    color: theme.colors.primary,
  },
  headingSidebar: {
    fontSize: S.titleFontSize,
    textAlign: "left",
    letterSpacing: -0.32,
  },
  group: {
    gap: S.itemGap,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  groupSidebar: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  groupDivided: {
    marginTop: S.groupMarginTop,
    paddingTop: S.groupPaddingTop,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: S.groupLabelMarginBottom,
    paddingHorizontal: S.groupLabelPaddingX,
    color: theme.colors.primaryBright,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingVertical: S.itemPaddingY,
    paddingHorizontal: S.itemPaddingX,
    borderRadius: S.itemRadius,
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

const USER_PROFILE_THUMB_SIZE = SPC.thumbSize;
export { USER_PROFILE_THUMB_SIZE };
export const USER_PROFILE_THUMB_SQUIRCLE_RADIUS = SPC.thumbRadius;
export const USER_PROFILE_THUMB_GAP = SPC.trackGap;
/** Паритет `.user-profile-purchases__list` / seller carousel track — фиксирует высоту на RN Web. */
export const USER_PROFILE_THUMB_TRACK_HEIGHT =
  SPC.thumbSize + SPC.trackPaddingTop + SPC.trackPaddingBottom;
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
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  rootHorizontal: {
    marginBottom: 0,
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderWidth: SPC.borderWidth,
  },
  rootHorizontalRadius: {
    borderRadius: SPC.borderRadius,
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
    paddingTop: SPC.headingPaddingTop,
    paddingHorizontal: SPC.headingPaddingHorizontal,
    paddingBottom: SPC.headingPaddingBottom,
    paddingVertical: 0,
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
    fontSize: SPC.headingFontSize,
    fontWeight: SPC.headingFontWeight,
    letterSpacing: SPC.headingLetterSpacing,
    lineHeight: SPC.headingLineHeight,
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
  bodyProfileScrollRow: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: "hidden",
    gap: 0,
  },
  bodyHorizontal: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 0,
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
  stateErrorHorizontal: {
    margin: 0,
    paddingHorizontal: SPC.errorPaddingHorizontal,
    paddingBottom: SPC.errorPaddingBottom,
    fontSize: SPC.errorFontSize,
    lineHeight: SPC.errorFontSize * 1.35,
    textAlign: "left",
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
  scrollRowContent: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: USER_PROFILE_THUMB_GAP,
    paddingTop: SPC.trackPaddingTop,
    paddingHorizontal: SPC.trackPaddingHorizontal,
    paddingBottom: SPC.trackPaddingBottom,
    flexGrow: 0,
    flexShrink: 0,
  },
  thumbButton: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    flex: 0,
    flexShrink: 0,
    flexGrow: 0,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? ({
          flexBasis: USER_PROFILE_THUMB_SIZE,
          minWidth: USER_PROFILE_THUMB_SIZE,
          maxWidth: USER_PROFILE_THUMB_SIZE,
          minHeight: USER_PROFILE_THUMB_SIZE,
          maxHeight: USER_PROFILE_THUMB_SIZE,
          alignSelf: "center",
        } as const)
      : null),
  },
  thumbButtonUnavailable: {
    opacity: SPC.thumbUnavailableOpacity,
  },
  thumbClip: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: SPC.thumbBorderWidth,
    borderColor: theme.colors.border,
  },
  thumbClipCurrent: {
    borderWidth: SPC.thumbCurrentOutlineWidth,
    borderColor: theme.colors.action,
  },
  thumbImageHost: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbPlaceholder: {
    width: USER_PROFILE_THUMB_SIZE,
    height: USER_PROFILE_THUMB_SIZE,
    backgroundColor: theme.colors.surfaceMuted,
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    color: theme.colors.warningText,
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
  titleLeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
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
