import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { formatRafflePrizeContentPosition } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import { isRafflePrizeVideo } from "@/entities/raffle/lib/isRafflePrizeVideo";
import { resolveRafflePrizeImageUrl } from "@/entities/raffle/lib/resolveRafflePrizeImageUrl";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_PRIZE_MEDIA_UI } from "@/shared/config";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";
import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";

const MEDIA_BLUR_RADIUS = 28;

const stopPointerBubble = (event: GestureResponderEvent) => {
  event.stopPropagation();
};

type RafflePrizeMediaSoundToggleProps = {
  isMuted: boolean;
  onToggle: (nextMuted: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

/** Паритет web `raffle-prize-media__sound-btn` — слой поверх swipe-overlay. */
export const RafflePrizeMediaSoundToggle = ({
  isMuted,
  onToggle,
  style,
}: RafflePrizeMediaSoundToggleProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const { theme } = useAppThemeSettings();

  const handleToggle = useCallback(() => {
    onToggle(!isMuted);
  }, [isMuted, onToggle]);

  return (
    <Pressable
      style={[styles.soundButton, styles.soundButtonOverlay, style]}
      accessibilityRole="button"
      accessibilityLabel={RAFFLE_PRIZE_MEDIA_UI.SOUND_TOGGLE_ARIA(isMuted)}
      accessibilityState={{ checked: !isMuted }}
      onPress={handleToggle}
      onPressIn={stopPointerBubble}
      onPressOut={stopPointerBubble}
    >
      <MaterialIcons
        name={isMuted ? "volume-off" : "volume-up"}
        size={18}
        color={theme.colors.onContrast}
      />
    </Pressable>
  );
};

type RafflePrizeMediaProps = {
  raffle: RaffleFromApi;
  showSoundToggle?: boolean;
  isVideoActive?: boolean;
  isMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** Паритет web RaffleProductsPage: contain + blur backdrop. */
  contentFit?: "cover" | "contain";
  blurBackground?: boolean;
};

export const RafflePrizeMedia = ({
  raffle,
  showSoundToggle = false,
  isVideoActive = true,
  isMuted: controlledMuted,
  onMutedChange,
  contentFit = "cover",
  blurBackground = false,
}: RafflePrizeMediaProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const [internalMuted, setInternalMuted] = useState(true);
  const isMuted = controlledMuted ?? internalMuted;

  const setMuted = useCallback(
    (nextMuted: boolean) => {
      onMutedChange?.(nextMuted);
      if (controlledMuted === undefined) {
        setInternalMuted(nextMuted);
      }
    },
    [controlledMuted, onMutedChange],
  );

  const isVideo = isRafflePrizeVideo(raffle);
  const imageSrc = useMemo(() => resolveRafflePrizeImageUrl(raffle), [raffle]);
  const videoSrc = useMemo(() => resolveRafflePrizeVideoUrl(raffle), [raffle]);
  const contentPosition = useMemo(() => formatRafflePrizeContentPosition(raffle), [raffle]);

  if (isVideo && videoSrc) {
    return (
      <View style={styles.videoWrap} collapsable={false} pointerEvents="box-none">
        {blurBackground ? (
          <View style={styles.mediaBlurBgWrap} pointerEvents="none">
            <LoopingCoverVideo
              uri={videoSrc}
              isMuted
              isPlaying={isVideoActive}
              contentFit="cover"
              style={styles.mediaBlurBgVideo}
            />
            {Platform.OS !== "web" ? (
              <BlurView
                intensity={Platform.OS === "ios" ? 56 : 72}
                tint="dark"
                style={styles.mediaBlurOverlay}
                pointerEvents="none"
              />
            ) : null}
          </View>
        ) : null}
        <LoopingCoverVideo
          uri={videoSrc}
          isMuted={isMuted}
          isPlaying={isVideoActive}
          contentFit={contentFit}
          onUnmuteRejected={() => setMuted(true)}
          style={blurBackground ? styles.mediaFg : styles.media}
        />
        {showSoundToggle ? (
          <RafflePrizeMediaSoundToggle isMuted={isMuted} onToggle={setMuted} />
        ) : null}
      </View>
    );
  }

  if (!imageSrc) {
    return null;
  }

  if (blurBackground) {
    return (
      <View style={styles.mediaFrame} pointerEvents="box-none">
        <Image
          source={{ uri: imageSrc }}
          style={styles.mediaBlurBg}
          contentFit="cover"
          contentPosition={contentPosition}
          blurRadius={MEDIA_BLUR_RADIUS}
          accessible={false}
          pointerEvents="none"
        />
        <Image
          source={{ uri: imageSrc }}
          style={styles.mediaFg}
          contentFit={contentFit}
          contentPosition={contentPosition}
          pointerEvents="none"
        />
      </View>
    );
  }

  return (
    <View style={styles.mediaFrame} pointerEvents="box-none">
      <Image
        source={{ uri: imageSrc }}
        style={styles.media}
        contentFit={contentFit}
        contentPosition={contentPosition}
        pointerEvents="none"
      />
    </View>
  );
};
