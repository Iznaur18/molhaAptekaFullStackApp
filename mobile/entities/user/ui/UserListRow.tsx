import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { formatSearchRowTotalSalesCount } from "@/entities/user/lib/formatSearchRowTotalSales";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserListRowMetric } from "@/entities/user/ui/UserListRowMetric";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { useUserListRowStyles } from "@/shared/theme/userListRowStyles";

type UserListRowProps = {
  user: UserSearchListItem;
  onRowClick?: (userId: string) => void;
};

export const UserListRow = ({ user, onRowClick }: UserListRowProps) => {
  const styles = useUserListRowStyles();
  const [imgFailed, setImgFailed] = useState(false);

  const picked = pickUserProfilePhotoUrl(user);
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const userName = String(user.userName ?? "").trim();
  const email = String(user.email ?? "").trim();
  const displayName = userName || USER_LIST_ROW_UI.MISSING_NAME;
  const showEmail = email.length > 0 && email !== userName;
  const isPremium = user.isPremiumUser === true;
  const isUserDataConfirmed = user.isUserDataConfirmed === true;

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(user.userRatingByVotes),
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

  const metaBadges = useMemo(() => {
    if (user.isBlockedUser !== true) {
      return [];
    }
    return [USER_LIST_ROW_UI.BADGE_BLOCKED];
  }, [user.isBlockedUser]);

  const handlePress = () => {
    onRowClick?.(String(user._id));
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
      accessibilityRole="button"
    >
      <View style={styles.head}>
        <UserPremiumAvatar
          uri={src}
          isPremium={isPremium}
          onError={() => setImgFailed(true)}
          style={styles.avatar}
        />
        <View style={styles.nameWrap}>
          <UserPremiumDisplayName
            name={displayName}
            isPremium={isPremium}
            isUserDataConfirmed={isUserDataConfirmed}
            badgeSize={14}
            textStyle={styles.nameText}
          />
        </View>
      </View>

      {showEmail ? (
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      ) : null}

      {metaBadges.length > 0 ? (
        <View style={styles.badges}>
          {metaBadges.map((label) => (
            <View key={label} style={styles.badge}>
              <Text style={styles.badgeText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.metrics}>
        <UserListRowMetric
          label={USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL}
          value={totalSalesCountText}
          accessibilityLabel={`${USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL} ${totalSalesCountText}`}
        />
        <UserListRowMetric
          label={USER_LIST_ROW_UI.RATING_SCORE_LABEL}
          value={ratingText}
          variant="muted"
          accessibilityLabel={`${USER_LIST_ROW_UI.RATING_SCORE_LABEL} ${ratingText}`}
        />
        <UserListRowMetric
          label={USER_LIST_ROW_UI.FOLLOWERS_LABEL}
          value={followersText}
        />
      </View>
    </Pressable>
  );
};
