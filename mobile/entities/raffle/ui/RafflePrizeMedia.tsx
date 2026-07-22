import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { formatRafflePrizeContentPosition } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import { isRafflePrizeVideo } from "@/entities/raffle/lib/isRafflePrizeVideo";
import { resolveRafflePrizeImageUrl } from "@/entities/raffle/lib/resolveRafflePrizeImageUrl";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_PRIZE_MEDIA_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";
import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";

type RafflePrizeMediaProps = {
  raffle: RaffleFromApi;
  showSoundToggle?: boolean;
  isVideoActive?: boolean;
};

export const RafflePrizeMedia = ({
  raffle,
  showSoundToggle = false,
  isVideoActive = true,
}: RafflePrizeMediaProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const { theme } = useAppThemeSettings();
  const [isMuted, setIsMuted] = useState(true);

  const isVideo = isRafflePrizeVideo(raffle);
  const imageSrc = useMemo(() => resolveRafflePrizeImageUrl(raffle), [raffle]);
  const videoSrc = useMemo(() => resolveRafflePrizeVideoUrl(raffle), [raffle]);
  const contentPosition = useMemo(() => formatRafflePrizeContentPosition(raffle), [raffle]);

  if (isVideo && videoSrc) {
    return (
      <View style={styles.videoWrap} collapsable={false} pointerEvents="box-none">
        <LoopingCoverVideo
          uri={videoSrc}
          isMuted={isMuted}
          isPlaying={isVideoActive}
          style={styles.media}
        />
        {showSoundToggle ? (
          <Pressable
            style={styles.soundButton}
            accessibilityRole="button"
            accessibilityLabel={RAFFLE_PRIZE_MEDIA_UI.SOUND_TOGGLE_ARIA(isMuted)}
            accessibilityState={{ checked: !isMuted }}
            onPress={() => setIsMuted((prev) => !prev)}
          >
            <MaterialIcons
              name={isMuted ? "volume-off" : "volume-up"}
              size={18}
              color={theme.colors.onContrast}
            />
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!imageSrc) {
    return null;
  }

  return (
    <View style={styles.mediaFrame}>
      <Image
        source={{ uri: imageSrc }}
        style={styles.media}
        contentFit="cover"
        contentPosition={contentPosition}
      />
    </View>
  );
};
