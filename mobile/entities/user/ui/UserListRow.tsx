import { useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { useUserListRowStyles } from "@/shared/theme/accountFeatureStyles";

type UserListRowProps = {
  user: UserSearchListItem;
  onPress?: (userId: string) => void;
};

export const UserListRow = ({ user, onPress }: UserListRowProps) => {
  const styles = useUserListRowStyles();
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
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
    >
      <View style={styles.head}>
        <Image source={{ uri: src }} style={styles.avatar} onError={() => setImgFailed(true)} />
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {showEmail ? (
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      ) : null}

      {user.isBlockedUser === true ? (
        <View style={styles.bannedBadge}>
          <Text style={styles.bannedText}>{USER_LIST_ROW_UI.BADGE_BLOCKED}</Text>
        </View>
      ) : null}

      <View style={styles.metrics}>
        <Text style={styles.metric}>
          {USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL}: {totalSalesCountText}
        </Text>
        <Text style={styles.metric}>
          {USER_LIST_ROW_UI.RATING_SCORE_LABEL}: {ratingText}
        </Text>
        <Text style={styles.metric}>
          {USER_LIST_ROW_UI.FOLLOWERS_LABEL}: {followersText}
        </Text>
      </View>
    </Pressable>
  );
};
