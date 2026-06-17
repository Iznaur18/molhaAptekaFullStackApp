import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import { openProfileStaffWebSection } from "@/features/profile-hub/lib/openProfileStaffWebSection";
import {
  isProfileStaffWebOnlySection,
  PROFILE_SECTION_OVERVIEW,
  resolveProfileSectionRoute,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { useProfileHubAccess } from "@/features/profile-hub/model/useProfileHubAccess";
import { useStaffHubBadgeCounts } from "@/features/profile-hub/model/useStaffHubBadgeCounts";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileHubMenuStyles } from "@/shared/theme/profileChromeStyles";

import type { ProfileNavItem } from "../model/buildProfileNavGroups";

type ProfileHubMenuProps = {
  activeSectionId?: ProfileSectionId;
  onOverviewPress?: () => void;
  onNavigate?: () => void;
  variant?: "inline" | "sheet";
};

const ProfileHubNavItem = ({
  item,
  isActive,
  onPress,
}: {
  item: ProfileNavItem;
  isActive: boolean;
  onPress: () => void;
}) => {
  const styles = useProfileHubMenuStyles();
  const isCta = item.variant === "cta";
  const isDisabled = item.disabled === true;

  return (
    <Pressable
      style={[
        styles.item,
        isActive && styles.itemActive,
        isCta && styles.itemCta,
        isDisabled && styles.itemDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityState={{ selected: isActive }}
    >
      <Text
        style={[
          styles.itemLabel,
          isActive && styles.itemLabelActive,
          isCta && styles.itemLabelCta,
          isDisabled && styles.itemLabelDisabled,
        ]}
      >
        {item.label}
      </Text>
      {item.showAlert ? <View style={styles.alertDot} /> : null}
      {item.badgeCount != null && item.badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {MY_PROFILE_PAGE_UI.TAB_BADGE(item.badgeCount)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export const ProfileHubMenu = ({
  activeSectionId,
  onOverviewPress,
  onNavigate,
  variant = "inline",
}: ProfileHubMenuProps) => {
  const router = useRouter();
  const styles = useProfileHubMenuStyles();
  const hubAccess = useProfileHubAccess();
  const badgeCounts = useStaffHubBadgeCounts(hubAccess);

  const navGroups = useMemo(
    () => buildProfileNavGroups(hubAccess, badgeCounts),
    [hubAccess, badgeCounts],
  );

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
      style={[styles.root, variant === "sheet" && styles.rootSheet]}
      accessibilityLabel={MY_PROFILE_PAGE_UI.NAV_ARIA}
    >
      <Text style={styles.heading}>{MY_PROFILE_PAGE_UI.TAB_TITLE}</Text>
      {navGroups.map((group) => (
        <View key={group.id} style={styles.group}>
          {group.label ? <Text style={styles.groupLabel}>{group.label}</Text> : null}
          {group.items.map((item) => (
            <ProfileHubNavItem
              key={item.sectionId}
              item={item}
              isActive={activeSectionId === item.sectionId}
              onPress={() => openSection(item.sectionId)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
