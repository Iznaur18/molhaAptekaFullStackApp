import { Image } from "expo-image";
import { useMemo } from "react";
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
  const resolvedFocus = focus ?? getUserAvatarFocus(null);
  // Мемоизация по координатам/строке uri: фоновый рефетч данных не должен
  // передёргивать вью аватара при неизменных фото и позиции.
  const contentPosition = useMemo(
    () => formatProfileImageContentPosition(resolvedFocus),
    [resolvedFocus.x, resolvedFocus.y],
  );
  const source = useMemo(() => ({ uri }), [uri]);

  return (
    <View style={[styles.wrap, isPremium && styles.wrapPremium, style]}>
      <Image
        source={source}
        style={styles.image}
        contentFit="cover"
        contentPosition={contentPosition}
        cachePolicy="memory-disk"
        recyclingKey={uri}
        onError={onError}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
};
