import { Image } from "expo-image";
import { View } from "react-native";

import { isRafflePrizeVideo } from "@/entities/raffle/lib/isRafflePrizeVideo";
import { resolveRafflePrizeImageUrl } from "@/entities/raffle/lib/resolveRafflePrizeImageUrl";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";
import { useRafflesStaffPageStyles } from "@/shared/theme/rafflesStaffPageStyles";

type RafflesStaffRowMediaProps = {
  raffle: RaffleFromApi;
};

export const RafflesStaffRowMedia = ({ raffle }: RafflesStaffRowMediaProps) => {
  const styles = useRafflesStaffPageStyles();
  const isVideo = isRafflePrizeVideo(raffle);
  const imageSrc = resolveRafflePrizeImageUrl(raffle);
  const videoSrc = resolveRafflePrizeVideoUrl(raffle);

  return (
    <View style={styles.thumbWrap}>
      {isVideo && videoSrc ? (
        <View style={styles.thumbVideo}>
          <ProductPreviewVideo uri={videoSrc} />
        </View>
      ) : imageSrc ? (
        <Image source={{ uri: imageSrc }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
    </View>
  );
};
