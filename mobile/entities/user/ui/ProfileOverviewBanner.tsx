import { useMemo, useState } from "react";
import { Image, View } from "react-native";

import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { resolveUserProfileBackgroundFromUser } from "@/entities/user/lib/resolveUserProfileBackgroundFromUser";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileOverviewBannerStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

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
  const styles = useProfileOverviewBannerStyles();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [backgroundLoadFailed, setBackgroundLoadFailed] = useState(false);

  const photoUrl = useMemo(() => pickUserProfilePhotoUrl(user), [user]);
  const profileBackground = useMemo(
    () => resolveUserProfileBackgroundFromUser(user),
    [user],
  );
  const canShowBackground =
    profileBackground.kind === "preset" ||
    (profileBackground.kind === "image" && !backgroundLoadFailed);
  const showBanner =
    canShowBackground || (Boolean(photoUrl) && !avatarLoadFailed);

  if (!showBanner) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.banner,
          profileBackground.kind === "preset" && canShowBackground
            ? { backgroundColor: profileBackground.color }
            : null,
          !canShowBackground && styles.bannerFallback,
        ]}
      >
        {profileBackground.kind === "image" && canShowBackground ? (
          <Image
            source={{ uri: profileBackground.url }}
            style={styles.bannerImage}
            onError={() => setBackgroundLoadFailed(true)}
          />
        ) : null}

        {canShowBackground ? <View style={styles.bannerScrim} pointerEvents="none" /> : null}

        {photoUrl && !avatarLoadFailed ? (
          <View
            style={[
              styles.avatarWrap,
              isPremiumActive(user) && styles.avatarWrapPremium,
            ]}
          >
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
              onError={() => setAvatarLoadFailed(true)}
            />
          </View>
        ) : null}

        {showEditButton && onEditPress ? (
          <AppButton
            label={MY_PROFILE_PAGE_UI.EDIT_PROFILE}
            variant="contrast"
            onPress={onEditPress}
            style={styles.editButton}
          />
        ) : null}
      </View>
    </View>
  );
};
