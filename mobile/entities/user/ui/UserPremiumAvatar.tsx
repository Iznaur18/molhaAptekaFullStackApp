import { Image } from "expo-image";
import { View, type StyleProp, type ViewStyle } from "react-native";

import {
  formatProfileImageContentPosition,
  getUserAvatarFocus,
  type ProfileImageFocus,
} from "@/entities/user/lib/profileImageFocus";
import { useUserPremiumAvatarStyles } from "@/shared/theme/userPremiumStyles";

type UserPremiumAvatarProps = {
  uri: string;
  isPremium?: boolean;
  focus?: ProfileImageFocus;
  onError?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const UserPremiumAvatar = ({
  uri,
  isPremium = false,
  focus,
  onError,
  style,
}: UserPremiumAvatarProps) => {
  const styles = useUserPremiumAvatarStyles();
  const contentPosition = formatProfileImageContentPosition(focus ?? getUserAvatarFocus(null));

  return (
    <View style={[styles.wrap, isPremium && styles.wrapPremium, style]}>
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="cover"
        contentPosition={contentPosition}
        onError={onError}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
};
