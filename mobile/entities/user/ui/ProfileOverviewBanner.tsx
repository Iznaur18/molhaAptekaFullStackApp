import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import {
  formatProfileImageContentPosition,
  getUserAvatarFocus,
  getUserBackgroundFocus,
} from "@/entities/user/lib/profileImageFocus";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { resolveUserProfileBackgroundFromUser } from "@/entities/user/lib/resolveUserProfileBackgroundFromUser";
import { UserPremiumAvatar } from "@/entities/user/ui/UserPremiumAvatar";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  PROFILE_CARD_SQUIRCLE_RADIUS,
  useProfileOverviewBannerStyles,
} from "@/shared/theme/profileChromeStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type ProfileOverviewBannerProps = {
  user: Record<string, unknown>;
  showEditButton?: boolean;
  onEditPress?: () => void;
};

export const ProfileOverviewBanner = ({
  user,
  showEditButton = false,
  onEditPress,
}: ProfileOverviewBannerProps) => {
  const theme = useAppTheme();
  const styles = useProfileOverviewBannerStyles();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

  const photoUrl = useMemo(() => pickUserProfilePhotoUrl(user), [user]);
  const profileBackground = useMemo(
    () => resolveUserProfileBackgroundFromUser(user),
    [user],
  );
  const avatarFocus = useMemo(() => getUserAvatarFocus(user), [user]);
  const backgroundFocus = useMemo(() => getUserBackgroundFocus(user), [user]);
  // Мемоизируем по координатам (не по ссылке focus): фоновый рефетч сессии
  // пересоздаёт объект focus с теми же x/y — вью не должна передёргиваться.
  const backgroundContentPosition = useMemo(
    () => formatProfileImageContentPosition(backgroundFocus),
    [backgroundFocus.x, backgroundFocus.y],
  );
  const backgroundImageUrl =
    profileBackground.kind === "image" ? profileBackground.url : null;
  // Стабильная ссылка на source по строке uri — иначе новый {uri} каждый рендер
  // заставляет expo-image сравнивать источник и мигать при обновлении данных.
  const backgroundSource = useMemo(
    () => (backgroundImageUrl ? { uri: backgroundImageUrl } : null),
    [backgroundImageUrl],
  );

  const canShowBackground =
    profileBackground.kind === "preset" ||
    (profileBackground.kind === "image" && !backgroundLoadFailed);
  const showBanner =
    canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed);
  const isPremium = isPremiumActive(user);

  if (!showBanner) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <SquircleView
        radius={PROFILE_CARD_SQUIRCLE_RADIUS}
        style={[
          styles.banner,
          profileBackground.kind === "preset" && canShowBackground
            ? { backgroundColor: profileBackground.color }
            : null,
          !canShowBackground && styles.bannerFallback,
        ]}
      >
        {profileBackground.kind === "image" && canShowBackground && backgroundSource ? (
          <Image
            source={backgroundSource}
            style={styles.bannerImage}
            contentFit="cover"
            contentPosition={backgroundContentPosition}
            cachePolicy="memory-disk"
            recyclingKey={backgroundImageUrl}
            onError={() => setBackgroundLoadFailed(true)}
          />
        ) : null}

        {canShowBackground ? <View style={styles.bannerScrim} pointerEvents="none" /> : null}

        {photoUrl && !avatarLoadFailed ? (
          <UserPremiumAvatar
            uri={photoUrl}
            isPremium={isPremium}
            focus={avatarFocus}
            onError={() => setAvatarLoadFailed(true)}
            style={[styles.avatarOnBanner, isPremium ? styles.avatarWrapPremium : null]}
          />
        ) : null}

        {showEditButton && onEditPress ? (
          <Pressable
            style={styles.editButton}
            onPress={onEditPress}
            accessibilityLabel={MY_PROFILE_PAGE_UI.EDIT_PROFILE}
          >
            <Feather name="edit-2" size={16} color={theme.colors.text} />
          </Pressable>
        ) : null}
      </SquircleView>
    </View>
  );
};
