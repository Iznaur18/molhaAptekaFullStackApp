import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import {
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
  onOverviewPress?: () => void;
};

const ProfileHubNavItem = ({
  item,
  onPress,
}: {
  item: ProfileNavItem;
  onPress: () => void;
}) => {
  const styles = useProfileHubMenuStyles();
  const isCta = item.variant === "cta";
  const isDisabled = item.disabled === true;

  return (
    <Pressable
      style={[
        styles.item,
        isCta && styles.itemCta,
        isDisabled && styles.itemDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.itemLabel,
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

export const ProfileHubMenu = ({ onOverviewPress }: ProfileHubMenuProps) => {
  const router = useRouter();
  const styles = useProfileHubMenuStyles();
  const hubAccess = useProfileHubAccess();
  const badgeCounts = useStaffHubBadgeCounts(hubAccess);

  const navGroups = useMemo(
    () => buildProfileNavGroups(hubAccess, badgeCounts),
    [hubAccess, badgeCounts],
  );

  const openSection = (sectionId: ProfileSectionId) => {
    if (sectionId === PROFILE_SECTION_OVERVIEW) {
      onOverviewPress?.();
      return;
    }

    const route = resolveProfileSectionRoute(sectionId);
    if (route) {
      router.push(route as never);
    }
  };

  if (!hubAccess.isProfileReady) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>{MY_PROFILE_PAGE_UI.TAB_TITLE}</Text>
      {navGroups.map((group) => (
        <View key={group.id} style={styles.group}>
          {group.label ? <Text style={styles.groupLabel}>{group.label}</Text> : null}
          {group.items.map((item) => (
            <ProfileHubNavItem
              key={item.sectionId}
              item={item}
              onPress={() => openSection(item.sectionId)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
