import { type StyleProp, Text, type TextStyle, View } from "react-native";

import { UserDataConfirmedBadge } from "@/entities/user/ui/UserDataConfirmedBadge";
import { UserPremiumVerifiedBadge } from "@/entities/user/ui/UserPremiumVerifiedBadge";
import { USER_DATA_CONFIRMED_UI, USER_PREMIUM_UI } from "@/shared/config";
import { useUserPremiumDisplayNameStyles } from "@/shared/theme/userPremiumStyles";

type UserPremiumDisplayNameProps = {
  name: string;
  isPremium?: boolean;
  isUserDataConfirmed?: boolean;
  badgeSize?: number;
  textStyle?: StyleProp<TextStyle>;
  /** Одна строка без переноса бейджей — seller-meta / списки. */
  singleLine?: boolean;
};

export const UserPremiumDisplayName = ({
  name,
  isPremium = false,
  isUserDataConfirmed = false,
  badgeSize = 18,
  textStyle,
  singleLine = false,
}: UserPremiumDisplayNameProps) => {
  const styles = useUserPremiumDisplayNameStyles();

  return (
    <View style={[styles.root, singleLine && styles.rootSingleLine]}>
      {singleLine ? (
        <View style={styles.textClip}>
          <Text
            style={[styles.text, styles.textSingleLine, textStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, textStyle]} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
      )}
      {isPremium ? (
        <View
          style={styles.badgeSlot}
          accessibilityLabel={USER_PREMIUM_UI.CHECK_ARIA}
          accessibilityHint={USER_PREMIUM_UI.CHECK_TITLE}
        >
          <UserPremiumVerifiedBadge size={badgeSize} />
        </View>
      ) : null}
      {isUserDataConfirmed ? (
        <View
          style={styles.badgeSlot}
          accessibilityLabel={USER_DATA_CONFIRMED_UI.BADGE_ARIA}
          accessibilityHint={USER_DATA_CONFIRMED_UI.BADGE_TITLE}
        >
          <UserDataConfirmedBadge size={badgeSize} />
        </View>
      ) : null}
    </View>
  );
};
