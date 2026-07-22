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
import { USER_LIST_ROW_UI, USERS_PODIUM_UI } from "@/shared/config";
import {
  resolveUserListRowMetricsStacked,
  useUserListRowStyles,
} from "@/shared/theme/userListRowStyles";

type UserListRowProps = {
  user: UserSearchListItem;
  onRowClick?: (userId: string) => void;
  podiumPlace?: 1 | 2 | 3;
};

export const UserListRow = ({ user, onRowClick, podiumPlace }: UserListRowProps) => {
  const styles = useUserListRowStyles();
  const [imgFailed, setImgFailed] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const metricsStacked = resolveUserListRowMetricsStacked(cardWidth);

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
  const loyaltyPointsText = useMemo(() => {
    const value = Number(user.userLoyaltyPoints);
    return Number.isFinite(value) ? String(Math.max(0, Math.floor(value))) : "0";
  }, [user.userLoyaltyPoints]);

  const metaBadges = useMemo(() => {
    const badges: string[] = [];
    if (podiumPlace === 1) {
      badges.push(USERS_PODIUM_UI.PLACE_1);
    } else if (podiumPlace === 2) {
      badges.push(USERS_PODIUM_UI.PLACE_2);
    } else if (podiumPlace === 3) {
      badges.push(USERS_PODIUM_UI.PLACE_3);
    }
    if (user.isBlockedUser === true) {
      badges.push(USER_LIST_ROW_UI.BADGE_BLOCKED);
    }
    return badges;
  }, [podiumPlace, user.isBlockedUser]);

  const handlePress = () => {
    onRowClick?.(String(user._id));
  };

  const handleCardLayout = (width: number) => {
    if (width !== cardWidth) {
      setCardWidth(width);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        podiumPlace === 1 && styles.rowPodium1,
        podiumPlace === 2 && styles.rowPodium2,
        podiumPlace === 3 && styles.rowPodium3,
        pressed && styles.rowPressed,
      ]}
      onLayout={(event) => {
        handleCardLayout(event.nativeEvent.layout.width);
      }}
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
            <View
              key={label}
              style={[
                styles.badge,
                label === USERS_PODIUM_UI.PLACE_1 && styles.badgePodium1,
                label === USERS_PODIUM_UI.PLACE_2 && styles.badgePodium2,
                label === USERS_PODIUM_UI.PLACE_3 && styles.badgePodium3,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  (label === USERS_PODIUM_UI.PLACE_1 ||
                    label === USERS_PODIUM_UI.PLACE_2 ||
                    label === USERS_PODIUM_UI.PLACE_3) &&
                    styles.badgePodiumText,
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.metrics, metricsStacked && styles.metricsStacked]}>
        <UserListRowMetric
          label={USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL}
          value={totalSalesCountText}
          stacked={metricsStacked}
          accessibilityLabel={`${USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL} ${totalSalesCountText}`}
        />
        <UserListRowMetric
          label={USER_LIST_ROW_UI.RATING_SCORE_LABEL}
          value={ratingText}
          variant="muted"
          stacked={metricsStacked}
          accessibilityLabel={`${USER_LIST_ROW_UI.RATING_SCORE_LABEL} ${ratingText}`}
        />
        <UserListRowMetric
          label={USER_LIST_ROW_UI.FOLLOWERS_LABEL}
          value={followersText}
          stacked={metricsStacked}
        />
        <UserListRowMetric
          label={USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL}
          value={loyaltyPointsText}
          stacked={metricsStacked}
          accessibilityLabel={`${USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL} ${loyaltyPointsText}`}
        />
      </View>
    </Pressable>
  );
};
