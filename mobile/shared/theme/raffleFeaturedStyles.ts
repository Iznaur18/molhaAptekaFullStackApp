import { StyleSheet } from "react-native";

import { RAFFLE_FEATURED_BANNER_LAYOUT as L } from "@/entities/raffle/lib/raffleFeaturedBannerLayout";
import { RAFFLE_FEATURED_PALETTE as P } from "@/entities/raffle/lib/raffleFeaturedPalette";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { SCREEN_CONTENT_SECTION_GAP } from "@/shared/theme/screenContentLayout";

export const useRaffleFeaturedBannerStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    marginBottom: SCREEN_CONTENT_SECTION_GAP,
  },
  inner: {
    width: "100%",
    maxWidth: "100%",
    borderWidth: 2,
    borderColor: P.premiumPurpleMuted,
    borderRadius: L.borderRadius,
    overflow: "hidden",
    backgroundColor: P.accentPinkLilac,
    paddingHorizontal: L.innerPaddingHorizontal,
    paddingTop: L.innerPaddingTop,
    paddingBottom: L.innerPaddingBottom,
    shadowColor: P.accentPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  innerCompleted: {
    borderColor: P.successLight,
    backgroundColor: P.successSurface,
    shadowColor: P.successVivid,
  },
  visual: {
    position: "relative",
    alignSelf: "stretch",
    height: L.visualMinHeight,
    minHeight: L.visualMinHeight,
    marginTop: -L.imageBleedTop,
    marginLeft: -L.imageBleedX,
    marginRight: -L.imageBleedX,
    marginBottom: 0,
    borderTopLeftRadius: L.visualRadiusTop,
    borderTopRightRadius: L.visualRadiusTop,
    borderBottomLeftRadius: L.visualRadiusBottom,
    borderBottomRightRadius: L.visualRadiusBottom,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
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
    right: L.soundButtonInset,
    bottom: L.soundButtonInset,
    width: L.soundButtonSize,
    height: L.soundButtonSize,
    borderRadius: L.soundButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 17, 0.55)",
  },
  badge: {
    position: "absolute",
    top: L.badgeInset,
    left: L.badgeInset,
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
    paddingTop: 10,
    gap: 0,
  },
  title: {
    marginBottom: 5,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: theme.colors.text,
    flexShrink: 1,
  },
  description: {
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
    opacity: 0.88,
  },
  progressWrap: {
    marginBottom: 12,
  },
  progressBar: {
    height: 9,
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
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    flexShrink: 1,
  },
  manage: {
    marginBottom: 10,
    paddingBottom: 10,
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
