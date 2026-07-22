import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { UsersPodiumEntry, UsersPodiumPlace } from "@izibuy/shared-lib";
import { orderUsersPodiumForDisplay } from "@izibuy/shared-lib";

import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { USER_LIST_ROW_UI, USERS_PODIUM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useUsersPodiumStyles } from "@/shared/theme/usersPodiumStyles";

const PODIUM_FIRST_PLACE_TROPHY_ICON_SIZE = 14;

type UsersPodiumProps = {
  entries: UsersPodiumEntry<UserSearchListItem>[];
  onUserPress?: (userId: string) => void;
};

const PLACE_LABEL: Record<UsersPodiumPlace, string> = {
  1: USERS_PODIUM_UI.PLACE_1,
  2: USERS_PODIUM_UI.PLACE_2,
  3: USERS_PODIUM_UI.PLACE_3,
};

const formatFollowers = (value: unknown): string => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Math.max(0, Math.floor(parsed))) : "0";
};

const formatLoyaltyPoints = (value: unknown): string => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Math.max(0, Math.floor(parsed))) : "0";
};

type UsersPodiumSlotProps = {
  entry: UsersPodiumEntry<UserSearchListItem>;
  onUserPress?: (userId: string) => void;
};

const UsersPodiumSlot = ({ entry, onUserPress }: UsersPodiumSlotProps) => {
  const styles = useUsersPodiumStyles();
  const theme = useAppTheme();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { place, user } = entry;

  const pickedAvatar = pickUserProfilePhotoUrl(user);
  const avatarUri =
    !avatarFailed && pickedAvatar ? pickedAvatar : DEFAULT_USER_AVATAR_URL;
  const displayName =
    String(user.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = user.isPremiumUser === true;
  const isConfirmed = user.isUserDataConfirmed === true;

  const metrics = useMemo(
    () => [
      {
        key: "points",
        label: USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL,
        value: formatLoyaltyPoints(user.userLoyaltyPoints),
      },
      {
        key: "sales",
        label: USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL,
        value: formatSearchRowTotalSalesCount(user.totalSalesCount),
      },
      {
        key: "rating",
        label: USER_LIST_ROW_UI.RATING_SCORE_LABEL,
        value: formatSearchRowRatingCompact(user.userRatingByVotes),
      },
      {
        key: "followers",
        label: USER_LIST_ROW_UI.FOLLOWERS_LABEL,
        value: formatFollowers(user.followersCount),
      },
    ],
    [user],
  );

  const slotToneStyle =
    place === 1
      ? styles.slotPlace1
      : place === 2
        ? styles.slotPlace2
        : styles.slotPlace3;
  const badgeToneStyle =
    place === 1
      ? styles.placeBadge1
      : place === 2
        ? styles.placeBadge2
        : styles.placeBadge3;
  const avatarStyle =
    place === 1 ? styles.avatarPlace1 : styles.avatarPlaceOther;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.slot,
        slotToneStyle,
        pressed && styles.slotPressed,
      ]}
      onPress={() => onUserPress?.(String(user._id))}
      accessibilityRole="button"
      accessibilityLabel={`${PLACE_LABEL[place]} ${displayName}`}
    >
      <View style={[styles.placeBadge, badgeToneStyle]}>
        {place === 1 ? (
          <MaterialIcons
            name="emoji-events"
            size={PODIUM_FIRST_PLACE_TROPHY_ICON_SIZE}
            color={theme.colors.onContrast}
          />
        ) : (
          <Text style={styles.placeBadgeText}>{place}</Text>
        )}
      </View>
      <UserPremiumAvatar
        uri={avatarUri}
        isPremium={isPremium}
        onError={() => setAvatarFailed(true)}
        style={avatarStyle}
      />
      <UserPremiumDisplayName
        name={displayName}
        isPremium={isPremium}
        isUserDataConfirmed={isConfirmed}
        badgeSize={12}
        textStyle={styles.nameText}
      />
      <Text style={styles.placeLabel}>{PLACE_LABEL[place]}</Text>
      <View style={styles.metrics}>
        {metrics.map((metric) => (
          <View key={metric.key} style={styles.metricRow}>
            <Text style={styles.metricLabel} numberOfLines={1}>
              {metric.label}
            </Text>
            <Text style={styles.metricValue} numberOfLines={1}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

export const UsersPodium = ({ entries, onUserPress }: UsersPodiumProps) => {
  const styles = useUsersPodiumStyles();
  const displayEntries = useMemo(
    () => orderUsersPodiumForDisplay(entries),
    [entries],
  );

  if (displayEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{USERS_PODIUM_UI.TITLE}</Text>
      <View style={styles.row}>
        {displayEntries.map((entry) => (
          <UsersPodiumSlot
            key={String(entry.user._id)}
            entry={entry}
            onUserPress={onUserPress}
          />
        ))}
      </View>
    </View>
  );
};
