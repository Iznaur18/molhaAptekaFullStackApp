import { resolveProfileNavSectionTone, type ProfileNavToneId } from "@izibuy/shared-lib";

import { resolveProfileNavIconName } from "@/features/profile-hub/lib/profileNavIcons";

import type { ProfileNavItem } from "../model/buildProfileNavGroups";

export type EnrichedProfileNavItem = ProfileNavItem & {
  tone: ProfileNavToneId;
  iconName: ReturnType<typeof resolveProfileNavIconName>;
};

export const enrichProfileNavItem = (item: ProfileNavItem): EnrichedProfileNavItem => ({
  ...item,
  tone: resolveProfileNavSectionTone(item.sectionId),
  iconName: resolveProfileNavIconName(item.sectionId),
});
