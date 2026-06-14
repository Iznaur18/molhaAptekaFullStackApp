import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type UserListRowProps = {
  user: UserSearchListItem;
  onPress?: (userId: string) => void;
};

export const UserListRow = ({ user, onPress }: UserListRowProps) => {
  const theme = useAppTheme();
  const [imgFailed, setImgFailed] = useState(false);

  const picked = pickUserProfilePhotoUrl(user);
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const userName = String(user.userName ?? "").trim();
  const email = String(user.email ?? "").trim();
  const displayName = userName || USER_LIST_ROW_UI.MISSING_NAME;
  const showEmail = email.length > 0 && email !== userName;

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(user.userRatingByVotes as never),
    [user.userRatingByVotes],
  );
  const totalSalesCountText = useMemo(
    () => formatSearchRowTotalSalesCount(user.totalSalesCount),
    [user.totalSalesCount],
  );
  const followersText = useMemo(() => {
    const value = Number(user.followersCount);
    return Number.isFinite(value) ? String(Math.max(0, Math.floor(value))) : "0";
  }, [user.followersCount]);

  const handlePress = () => {
    onPress?.(String(user._id));
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.rowPressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.head}>
        <Image source={{ uri: src }} style={styles.avatar} onError={() => setImgFailed(true)} />
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {showEmail ? (
        <Text style={[styles.email, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {email}
        </Text>
      ) : null}

      {user.isBlockedUser === true ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{USER_LIST_ROW_UI.BADGE_BLOCKED}</Text>
        </View>
      ) : null}

      <View style={styles.metrics}>
        <Text style={[styles.metric, { color: theme.colors.textMuted }]}>
          {USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL}: {totalSalesCountText}
        </Text>
        <Text style={[styles.metric, { color: theme.colors.textMuted }]}>
          {USER_LIST_ROW_UI.RATING_SCORE_LABEL}: {ratingText}
        </Text>
        <Text style={[styles.metric, { color: theme.colors.textMuted }]}>
          {USER_LIST_ROW_UI.FOLLOWERS_LABEL}: {followersText}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  rowPressed: {
    opacity: 0.92,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f4f4f4",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    fontSize: 13,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#ffebee",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: "#c62828",
    fontWeight: "600",
  },
  metrics: {
    gap: 2,
  },
  metric: {
    fontSize: 13,
  },
});
