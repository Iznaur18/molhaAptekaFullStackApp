import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUserPremiumDisplayNameStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: "100%",
  },
  text: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
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
