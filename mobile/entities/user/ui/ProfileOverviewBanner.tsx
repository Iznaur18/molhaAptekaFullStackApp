import { useMemo, useState } from "react";
import { Image, View } from "react-native";

import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { resolveUserProfileBackgroundFromUser } from "@/entities/user/lib/resolveUserProfileBackgroundFromUser";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ProfileOverviewBannerProps = {
  user: Record<string, unknown>;
  showEditButton?: boolean;
  onEditPress?: () => void;
};

const useStyles = createThemedStyles((theme) => ({
  wrap: {
    marginBottom: theme.spacing[4],
  },
  banner: {
    minHeight: 148,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: theme.spacing[4],
  },
  bannerImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  avatarWrap: {
    position: "absolute",
    left: theme.spacing[4],
    bottom: theme.spacing[4],
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatarWrapPremium: {
    borderColor: theme.colors.premium,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    alignSelf: "flex-end",
  },
}));

export const ProfileOverviewBanner = ({
  user,
  showEditButton = false,
  onEditPress,
}: ProfileOverviewBannerProps) => {
  const styles = useStyles();
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
          profileBackground.kind === "preset" && { backgroundColor: profileBackground.color },
        ]}
      >
        {profileBackground.kind === "image" && canShowBackground ? (
          <Image
            source={{ uri: profileBackground.url }}
            style={styles.bannerImage}
            onError={() => setBackgroundLoadFailed(true)}
          />
        ) : null}

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
