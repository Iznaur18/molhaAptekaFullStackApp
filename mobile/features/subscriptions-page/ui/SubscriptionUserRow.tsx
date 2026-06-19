import { useState } from "react";
import { Pressable, View } from "react-native";

import { getUserAvatarFocus } from "@/entities/user/lib/profileImageFocus";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { useSubscriptionUserRowStyles } from "@/shared/theme/accountFeatureStyles";

type SubscriptionUserRowProps = {
  user: {
    _id: string;
    userName?: string;
    isPremiumUser?: boolean;
    isUserDataConfirmed?: boolean;
  };
  onPress: (userId: string) => void;
};

export const SubscriptionUserRow = ({ user, onPress }: SubscriptionUserRowProps) => {
  const styles = useSubscriptionUserRowStyles();
  const [imgFailed, setImgFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl(user);
  const uri = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const displayName = user.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;

  return (
    <Pressable
      style={styles.root}
      onPress={() => onPress(user._id)}
      accessibilityRole="button"
    >
      <UserPremiumAvatar
        uri={uri}
        isPremium={user.isPremiumUser === true}
        focus={getUserAvatarFocus(user)}
        onError={() => setImgFailed(true)}
        style={styles.avatar}
      />
      <View style={styles.nameWrap}>
        <UserPremiumDisplayName
          name={displayName}
          isPremium={user.isPremiumUser === true}
          isUserDataConfirmed={user.isUserDataConfirmed === true}
          badgeSize={16}
          textStyle={styles.nameText}
        />
      </View>
    </Pressable>
  );
};
