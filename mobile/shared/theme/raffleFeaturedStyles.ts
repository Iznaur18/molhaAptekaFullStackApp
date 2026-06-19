import { StyleSheet } from "react-native";

import { RAFFLE_FEATURED_BANNER_CHROME as L } from "@izibuy/shared-lib";

import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_SECTION_GAP } from "@/shared/theme/screenContentLayout";

const BANNER_BORDER_RADIUS = 16;
const VISUAL_RADIUS_TOP = 11;
const VISUAL_RADIUS_BOTTOM = 9.6;
const BADGE_INSET = 7;
const SOUND_BUTTON_INSET = 7;
const SOUND_BUTTON_SIZE = 32;

export const useRaffleFeaturedBannerStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    marginBottom: SCREEN_CONTENT_SECTION_GAP,
  },
  inner: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    borderWidth: 2,
    borderColor: P.premiumPurpleMuted,
    borderRadius: BANNER_BORDER_RADIUS,
    overflow: "hidden",
    shadowColor: P.accentPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  innerStacked: {
    flexDirection: "column",
    paddingTop: 0,
    paddingHorizontal: L.innerPaddingHorizontal,
    paddingBottom: L.innerPaddingBottom,
  },
  innerSplit: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: L.splitGridGap,
    paddingHorizontal: L.innerPaddingHorizontal,
    paddingTop: L.innerPaddingTop,
    paddingBottom: L.innerPaddingBottom,
  },
  innerCompleted: {
    borderColor: P.successLight,
    shadowColor: P.successVivid,
  },
  visual: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  visualStacked: {
    alignSelf: "stretch",
    marginHorizontal: -L.innerPaddingHorizontal,
    borderTopLeftRadius: BANNER_BORDER_RADIUS - 2,
    borderTopRightRadius: BANNER_BORDER_RADIUS - 2,
    borderBottomLeftRadius: VISUAL_RADIUS_BOTTOM,
    borderBottomRightRadius: VISUAL_RADIUS_BOTTOM,
  },
  visualSplit: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    marginTop: -L.imageBleedTop,
    marginLeft: -L.innerPaddingHorizontal,
    marginBottom: -L.imageBleedTop,
    borderTopLeftRadius: VISUAL_RADIUS_TOP,
    borderTopRightRadius: VISUAL_RADIUS_TOP,
    borderBottomLeftRadius: VISUAL_RADIUS_BOTTOM,
    borderBottomRightRadius: VISUAL_RADIUS_BOTTOM,
  },
  mediaFrame: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  videoWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P.black,
  },
  soundButton: {
    position: "absolute",
    right: SOUND_BUTTON_INSET,
    bottom: SOUND_BUTTON_INSET,
    width: SOUND_BUTTON_SIZE,
    height: SOUND_BUTTON_SIZE,
    borderRadius: SOUND_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 17, 0.55)",
  },
  badge: {
    position: "absolute",
    top: BADGE_INSET,
    left: BADGE_INSET,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: P.accentPurple,
  },
  badgeCompleted: {
    backgroundColor: P.successDeep,
  },
  badgeText: {
    color: P.onContrast,
    fontSize: 11,
    fontWeight: "700",
  },
  body: {
    minWidth: 0,
    paddingTop: L.bodyPaddingTop,
    gap: 0,
  },
  bodySplit: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  title: {
    marginBottom: L.titleMarginBottom,
    fontSize: 20,
    lineHeight: L.titleLineHeight,
    fontWeight: "700",
    color: theme.colors.text,
    flexShrink: 1,
  },
  description: {
    marginBottom: L.descriptionMarginBottom,
    fontSize: 14,
    lineHeight: L.descriptionLineHeight,
    color: theme.colors.text,
    opacity: 0.88,
  },
  progressWrap: {
    marginBottom: L.progressMarginBottom,
  },
  progressBar: {
    height: L.progressBarHeight,
    borderRadius: 999,
    backgroundColor: P.progressTrack,
    overflow: "hidden",
  },
  progressBarCompleted: {
    backgroundColor: P.progressTrackCompleted,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: P.accentPurple,
  },
  progressFillCompleted: {
    backgroundColor: P.successVivid,
  },
  progressLabel: {
    marginTop: L.progressLabelMarginTop,
    fontSize: 14,
    lineHeight: L.progressLabelLineHeight,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  manage: {
    marginBottom: L.manageMarginBottom,
    paddingBottom: L.managePaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.manageDivider,
  },
  manageCompleted: {
    borderBottomColor: P.manageDividerCompleted,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: "auto",
    minHeight: L.actionsMinHeight,
  },
  btnPrimary: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.accentPurple,
    backgroundColor: P.accentPurpleSoft,
  },
  btnPrimaryCompleted: {
    borderColor: P.success,
    backgroundColor: P.successPale,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: P.accentPurpleText,
  },
  btnPrimaryTextCompleted: {
    color: P.successMuted,
  },
  btnInstagram: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.accentPink,
    backgroundColor: P.accentPinkSoft,
  },
  btnInstagramText: {
    fontSize: 14,
    fontWeight: "600",
    color: P.accentPinkDeep,
  },
  completedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: P.successDeep,
  },
}));

export const useRaffleManageActionsStyles = createThemedStyles(() => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    minHeight: 32,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnEdit: {
    borderColor: P.accentPurple,
    backgroundColor: P.accentPurpleSoft,
  },
  btnDelete: {
    borderColor: P.dangerAccent,
    backgroundColor: P.dangerSoft,
  },
  btnPause: {
    borderColor: P.warning,
    backgroundColor: P.warningPeach,
  },
  btnEditText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.accentPurpleText,
  },
  btnDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.dangerText,
  },
  btnPauseText: {
    fontSize: 14,
    fontWeight: "700",
    color: P.warningBrownDeep,
  },
}));

export const useRaffleDescriptionModalStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: P.overlayMidnight,
  },
  dialog: {
    width: "100%",
    maxWidth: 512,
    maxHeight: "80%",
    borderWidth: 2,
    borderColor: P.premiumPurpleMuted,
    borderRadius: 16,
    backgroundColor: P.accentPinkSurface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    shadowColor: P.accentPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 38,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "700",
    color: P.accentPurpleText,
  },
  closeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.accentPurple,
    backgroundColor: P.accentPurpleSoft,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: P.accentPurpleText,
  },
  raffleTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    color: theme.colors.text,
  },
  textScroll: {
    maxHeight: 280,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.text,
    opacity: 0.92,
  },
}));

export const useRaffleFeaturedCarouselStyles = createThemedStyles(() => ({
  viewport: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    marginBottom: 0,
  },
  singleSlide: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
}));

export const RAFFLE_FEATURED_LAYOUT = {
  slideGap: 12,
} as const;
