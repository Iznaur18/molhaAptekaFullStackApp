import { StyleSheet } from "react-native";

import { HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET } from "@/shared/lib/homeCatalogHeaderLayout";
import { MEDIA_OVERLAY_SCRIM } from "@/shared/theme/catalogProductStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const HOME_CATALOG_BACKDROP_TOP_BLEED = 600;

export const HOME_CATALOG_BACKDROP_SOUND_TOGGLE_TOP_GAP = 8;

const HOME_CATALOG_BACKDROP_SOUND_TOGGLE_SIZE = 36;

export const useHomeCatalogBackdropStyles = createThemedStyles((theme) => ({
  hero: {
    width: "100%",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  topBleed: {
    position: "absolute",
    top: -HOME_CATALOG_BACKDROP_TOP_BLEED,
    left: 0,
    right: 0,
    height: HOME_CATALOG_BACKDROP_TOP_BLEED,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  soundToggle: {
    position: "absolute",
    right: HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET,
    zIndex: 2,
  },
  soundToggleButton: {
    width: HOME_CATALOG_BACKDROP_SOUND_TOGGLE_SIZE,
    height: HOME_CATALOG_BACKDROP_SOUND_TOGGLE_SIZE,
    borderRadius: HOME_CATALOG_BACKDROP_SOUND_TOGGLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEDIA_OVERLAY_SCRIM,
  },
}));
