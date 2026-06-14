import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { isPremiumActive } from "@/entities/user/lib/isPremiumActive";
import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { resolveUserProfileBackgroundFromUser } from "@/entities/user/lib/resolveUserProfileBackgroundFromUser";
import { MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

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
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.colors.nearBlack }]}
            onPress={onEditPress}
          >
            <Text style={styles.editButtonText}>{MY_PROFILE_PAGE_UI.EDIT_PROFILE}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  banner: {
    minHeight: 148,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  avatarWrap: {
    position: "absolute",
    left: 16,
    bottom: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#f4f4f4",
  },
  avatarWrapPremium: {
    borderColor: "#ffc107",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    alignSelf: "flex-end",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
