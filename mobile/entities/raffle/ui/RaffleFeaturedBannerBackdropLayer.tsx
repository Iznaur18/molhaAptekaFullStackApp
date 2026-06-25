import { Image } from "expo-image";
import { View } from "react-native";

import type { RaffleFeaturedBannerBackdrop } from "@/entities/raffle/lib/getRaffleFeaturedBannerBackdrop";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleFeaturedBannerBackdropLayerProps = {
  raffle: RaffleFromApi;
  backdrop: RaffleFeaturedBannerBackdrop;
  completed?: boolean;
};

export const RaffleFeaturedBannerBackdropLayer = ({
  raffle,
  backdrop,
  completed = false,
}: RaffleFeaturedBannerBackdropLayerProps) => {
  const styles = useRaffleFeaturedBannerStyles();

  if (!backdrop.hasBackdrop) {
    return null;
  }

  return (
    <>
      <View style={styles.backdropSlot} pointerEvents="none">
        {backdrop.useVideoBackdrop ? (
          <View style={styles.backdropMedia}>
            <RafflePrizeMedia raffle={raffle} />
          </View>
        ) : backdrop.imageUrl ? (
          <Image
            source={{ uri: backdrop.imageUrl }}
            style={styles.backdropMedia}
            contentFit="cover"
            contentPosition={backdrop.contentPosition as import("expo-image").ImageContentPosition}
            blurRadius={28}
          />
        ) : null}
      </View>
      <View
        style={[styles.backdropScrim, completed && styles.backdropScrimCompleted]}
        pointerEvents="none"
      />
    </>
  );
};
