import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import { enrichProfileNavItem } from "@/features/profile-hub/lib/enrichProfileNavItem";
import { openProfileStaffWebSection } from "@/features/profile-hub/lib/openProfileStaffWebSection";
import {
  isProfileStaffWebOnlySection,
  PROFILE_SECTION_OVERVIEW,
  resolveProfileSectionRoute,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { useProfileHubAccess } from "@/features/profile-hub/model/useProfileHubAccess";
import { useStaffHubBadgeCounts } from "@/features/profile-hub/model/useStaffHubBadgeCounts";
import { ProfileHubNavItem } from "@/features/profile-hub/ui/ProfileHubNavItem";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProfileHubMenuStyles } from "@/shared/theme/profileChromeStyles";

type ProfileHubMenuProps = {
  activeSectionId?: ProfileSectionId;
  onOverviewPress?: () => void;
  onNavigate?: () => void;
  variant?: "inline" | "sheet";
};

export const ProfileHubMenu = ({
  activeSectionId,
  onOverviewPress,
  onNavigate,
  variant = "inline",
}: ProfileHubMenuProps) => {
  const router = useRouter();
  const styles = useProfileHubMenuStyles();
  const { profileContentStyle } = useScreenLayout();
  const hubAccess = useProfileHubAccess();
  const badgeCounts = useStaffHubBadgeCounts(hubAccess);

  const navGroups = useMemo(() => {
    const groups = buildProfileNavGroups(hubAccess, badgeCounts);
    return groups.map((group) => ({
      ...group,
      items: group.items.map(enrichProfileNavItem),
    }));
  }, [hubAccess, badgeCounts]);

  const openSection = async (sectionId: ProfileSectionId) => {
    if (sectionId === PROFILE_SECTION_OVERVIEW) {
      onOverviewPress?.();
      return;
    }

    if (isProfileStaffWebOnlySection(sectionId)) {
      await openProfileStaffWebSection(sectionId);
      onNavigate?.();
      return;
    }

    const route = resolveProfileSectionRoute(sectionId);
    if (route) {
      router.push(route as never);
      onNavigate?.();
    }
  };

  if (!hubAccess.isProfileReady) {
    return null;
  }

  return (
    <View
      style={[styles.root, profileContentStyle, variant === "sheet" && styles.rootSheet]}
      accessibilityLabel={MY_PROFILE_PAGE_UI.NAV_ARIA}
    >
      <Text style={styles.heading}>{MY_PROFILE_PAGE_UI.TAB_TITLE}</Text>
      {navGroups.map((group, groupIndex) => (
        <View
          key={group.id}
          style={[styles.group, groupIndex > 0 && styles.groupDivided]}
        >
          {group.label ? <Text style={styles.groupLabel}>{group.label}</Text> : null}
          {group.items.map((item) => (
            <ProfileHubNavItem
              key={item.sectionId}
              item={item}
              isActive={activeSectionId === item.sectionId}
              onPress={() => void openSection(item.sectionId)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
