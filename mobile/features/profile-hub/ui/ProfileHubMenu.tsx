import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import {
  PROFILE_SECTION_OVERVIEW,
  resolveProfileSectionRoute,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { useProfileHubAccess } from "@/features/profile-hub/model/useProfileHubAccess";
import { useStaffHubBadgeCounts } from "@/features/profile-hub/model/useStaffHubBadgeCounts";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

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
  const theme = useAppTheme();
  const isCta = item.variant === "cta";
  const isDisabled = item.disabled === true;

  return (
    <Pressable
      style={[
        styles.item,
        { backgroundColor: theme.colors.surfaceMuted },
        isCta && { backgroundColor: theme.colors.action },
        isDisabled && styles.itemDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.itemLabel,
          { color: isCta ? theme.colors.onContrast : theme.colors.text },
          isDisabled && styles.itemLabelDisabled,
        ]}
      >
        {item.label}
      </Text>
      {item.showAlert ? (
        <View style={[styles.alertDot, { backgroundColor: theme.colors.warning }]} />
      ) : null}
      {item.badgeCount != null && item.badgeCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.danger }]}>
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
  const hubAccess = useProfileHubAccess();
  const badgeCounts = useStaffHubBadgeCounts(hubAccess);
  const theme = useAppTheme();

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
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {MY_PROFILE_PAGE_UI.TAB_TITLE}
      </Text>
      {navGroups.map((group) => (
        <View key={group.id} style={styles.group}>
          {group.label ? (
            <Text style={[styles.groupLabel, { color: theme.colors.textMuted }]}>
              {group.label}
            </Text>
          ) : null}
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

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 420,
    marginTop: 20,
    gap: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  itemDisabled: {
    opacity: 0.45,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  itemLabelDisabled: {
    opacity: 0.45,
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
