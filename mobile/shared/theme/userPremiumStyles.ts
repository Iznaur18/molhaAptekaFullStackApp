import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUserPremiumDisplayNameStyles = createThemedStyles(() => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  text: {
    flexShrink: 1,
    minWidth: 0,
  },
  badgeSlot: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
}));
