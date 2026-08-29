import { Platform } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const WEB_ELLIPSIS_TEXT =
  Platform.OS === "web"
    ? ({
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      } as const)
    : null;

export const useUserPremiumDisplayNameStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: "100%",
    alignSelf: "stretch",
  },
  rootSingleLine: {
    flex: 1,
    flexWrap: "nowrap",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  textClip: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  text: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  textSingleLine: {
    ...(Platform.OS === "web"
      ? {
          width: "100%",
          ...WEB_ELLIPSIS_TEXT,
        }
      : null),
    overflow: "hidden",
  },
  badgeSlot: {
    flexShrink: 0,
  },
}));

export const useUserPremiumAvatarStyles = createThemedStyles((theme) => ({
  wrap: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  wrapPremium: {
    borderWidth: 2,
    borderColor: theme.colors.premium,
  },
  image: {
    width: "100%",
    height: "100%",
  },
}));
