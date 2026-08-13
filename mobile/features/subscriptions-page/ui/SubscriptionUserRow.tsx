import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatSearchRowRatingCompact } from "@/entities/user/lib/formatSearchRowRating";
import { getUserAvatarFocus } from "@/entities/user/lib/profileImageFocus";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { USER_LIST_ROW_UI } from "@/shared/config";
import {
  SUBSCRIPTION_USER_ROW_BORDER_RADIUS,
  useSubscriptionUserRowStyles,
} from "@/shared/theme/subscriptionsPageStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type SubscriptionUserRowProps = {
  user: {
    _id: string;
    userName?: string;
    isPremiumUser?: boolean;
    isUserDataConfirmed?: boolean;
    userRatingByVotes?: { countVotes?: number; totalRating?: number };
    followersCount?: number;
    userLoyaltyPoints?: number;
  };
  onRowClick: (userId: string) => void;
};

export const SubscriptionUserRow = ({ user, onRowClick }: SubscriptionUserRowProps) => {
  const styles = useSubscriptionUserRowStyles();
  const [imgFailed, setImgFailed] = useState(false);
  const [pressed, setPressed] = useState(false);
  const picked = pickUserProfilePhotoUrl(user);
  const uri = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const displayName = user.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(user.userRatingByVotes),
    [user.userRatingByVotes],
  );
  const followersText = useMemo(() => {
    const value = Number(user.followersCount);
    return Number.isFinite(value) ? String(Math.max(0, Math.floor(value))) : "0";
  }, [user.followersCount]);
  const loyaltyPointsText = useMemo(() => {
    const value = Number(user.userLoyaltyPoints);
    return Number.isFinite(value) ? String(Math.max(0, Math.floor(value))) : "0";
  }, [user.userLoyaltyPoints]);

  return (
    <Pressable
      style={styles.pressable}
      onPress={() => onRowClick(user._id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
    >
      <SquircleView
        radius={SUBSCRIPTION_USER_ROW_BORDER_RADIUS}
        style={[styles.row, pressed && styles.rowPressed]}
      >
        <UserPremiumAvatar
          uri={uri}
          isPremium={user.isPremiumUser === true}
          focus={getUserAvatarFocus(user)}
          onError={() => setImgFailed(true)}
          style={styles.avatar}
        />
        <View style={styles.body}>
          <View style={styles.nameWrap}>
            <UserPremiumDisplayName
              name={displayName}
              isPremium={user.isPremiumUser === true}
              isUserDataConfirmed={user.isUserDataConfirmed === true}
              badgeSize={16}
              textStyle={styles.nameText}
            />
          </View>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{USER_LIST_ROW_UI.RATING_SCORE_LABEL}</Text>
              <Text style={styles.metricValue}>{ratingText}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{USER_LIST_ROW_UI.FOLLOWERS_LABEL}</Text>
              <Text style={styles.metricValue}>{followersText}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL}</Text>
              <Text style={styles.metricValue}>{loyaltyPointsText}</Text>
            </View>
          </View>
        </View>
      </SquircleView>
    </Pressable>
  );
};
