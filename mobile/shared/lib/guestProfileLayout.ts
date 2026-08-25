/**
 * Паритет client `GuestProfilePanel.css` + `AuthHeroBanner.css`.
 */
export const GUEST_PROFILE_LAYOUT = {
  columnMaxWidth: 420,
  heroRadius: 32,
  bodyGap: 16,
  bodyMarginY: 36,
  bodyPadX: 16,
  titleFontSize: 24,
  subtitleFontSize: 16,
  legalFontSize: 14,
  legalPaddingY: 8,
} as const;

/**
 * Паритет client `MyProfilePage.css` / `myProfileMobileNavConstants.js`.
 * ≤900 — drawer/sheet; >900 — постоянный sidebar.
 * ≤640 — phone toggle + sheet справа.
 */
export const MY_PROFILE_DRAWER_LAYOUT_MAX_PX = 900;
export const MY_PROFILE_PHONE_LAYOUT_MAX_PX = 640;
/** 16.25rem */
export const MY_PROFILE_SIDEBAR_WIDTH = 260;
/** `.my-profile-page__layout { gap: 1rem }` */
export const MY_PROFILE_LAYOUT_GAP = 16;
/** `.my-profile-page__main { gap: 0.75rem }` */
export const MY_PROFILE_MAIN_GAP = 12;
/** Как web app-shell `--app-shell-content-inline-padding` / `--iz-space-4` */
export const MY_PROFILE_SHELL_PAD_X = 16;

/**
 * Паритет client `MyProfilePage.css` overview (phone ≤640).
 */
export const PROFILE_OVERVIEW_LAYOUT = {
  shareRowGap: 4,
  shareRowMarginTop: 8,
  notificationsBtnHeight: 34,
  infoMarginTop: 12,
  footerGap: 12,
  footerMarginTop: 8,
  sectionToggleRadius: 20,
  sectionTogglePaddingY: 12,
  sectionTogglePaddingX: 14,
  sectionToggleBorderWidth: 2,
  sectionToggleIconSize: 36,
  sectionToggleIconRadius: 10,
  mainGap: MY_PROFILE_MAIN_GAP,
  scrollPaddingTop: 0,
} as const;
