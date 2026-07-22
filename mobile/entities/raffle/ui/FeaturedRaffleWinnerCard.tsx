import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { pickUserProfilePhotoUrl } from "@/entities/user/lib/pickUserProfilePhotoUrl";
import { DEFAULT_USER_AVATAR_URL } from "@/entities/user/model/constants";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useFeaturedRaffleWinnerCardStyles } from "@/shared/theme/raffleFeaturedStyles";

type FeaturedRaffleWinnerCardProps = {
  winner: NonNullable<RaffleFromApi["winner"]>;
};

export const FeaturedRaffleWinnerCard = ({ winner }: FeaturedRaffleWinnerCardProps) => {
  const styles = useFeaturedRaffleWinnerCardStyles();
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);

  const userName =
    typeof winner.userName === "string" && winner.userName.trim()
      ? winner.userName.trim()
      : RAFFLE_FEATURED_BANNER_UI.WINNER_FALLBACK_NAME;
  const picked = pickUserProfilePhotoUrl({
    userAvatarUrl: winner.userAvatarUrl,
  });
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;

  return (
    <View
      style={styles.root}
      accessibilityRole="summary"
      accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.WINNER_TITLE}
    >
      <Text style={styles.title}>{RAFFLE_FEATURED_BANNER_UI.WINNER_TITLE}</Text>
      <Pressable
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.WINNER_OPEN_PROFILE_ARIA(userName)}
        onPress={() =>
          router.push({ pathname: "/user/[id]", params: { id: String(winner._id) } })
        }
      >
        <Image
          source={{ uri: src }}
          style={styles.avatar}
          contentFit="cover"
          onError={() => setImgFailed(true)}
        />
        <Text style={styles.name} numberOfLines={1}>
          {userName}
        </Text>
      </Pressable>
    </View>
  );
};
