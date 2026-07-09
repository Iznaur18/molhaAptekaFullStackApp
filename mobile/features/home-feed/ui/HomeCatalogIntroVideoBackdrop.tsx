import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePlatformIntroPlaybackSource } from "@/entities/app-intro-settings/model/usePlatformIntroPlaybackSource";
import { APP_INTRO_UI } from "@/shared/config";
import {
  HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
  HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
  resolveHomeCatalogIntroBackdropHeight,
} from "@/shared/lib/homeCatalogBackdropLayout";
import {
  HOME_CATALOG_BACKDROP_SOUND_TOGGLE_TOP_GAP,
  useHomeCatalogBackdropStyles,
} from "@/shared/theme/homeCatalogBackdropStyles";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";

/**
 * Hero-шапка ленты: platform intro loop без звука, toggle в правом верхнем углу.
 * Обычный блок в потоке FlatList — скроллится вместе с контентом.
 */
export const HomeCatalogIntroVideoBackdrop = () => {
  const styles = useHomeCatalogBackdropStyles();
  const { theme } = useAppThemeSettings();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const height = resolveHomeCatalogIntroBackdropHeight(windowHeight);
  const { playback } = usePlatformIntroPlaybackSource();
  const [isMuted, setIsMuted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const hasVideo = Boolean(playback.videoMp4Src) && !videoFailed;
  const posterSrc = playback.posterSrc;
  const showPoster = Boolean(posterSrc) && !hasVideo;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.hero,
        {
          height,
          marginBottom: -HOME_CATALOG_FOREGROUND_SHEET_CAP_HEIGHT,
          backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.topBleed, { backgroundColor: HOME_CATALOG_PRIMARY_BACKDROP_COLOR }]}
      />

      {hasVideo ? (
        <LoopingCoverVideo
          uri={playback.videoMp4Src}
          loop
          isMuted={isMuted}
          onPlaybackFailed={() => setVideoFailed(true)}
          style={styles.media}
        />
      ) : null}

      {showPoster ? (
        <View pointerEvents="none" style={styles.media}>
          <Image
            source={{ uri: posterSrc! }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {hasVideo ? (
        <View
          style={[
            styles.soundToggle,
            { top: insets.top + HOME_CATALOG_BACKDROP_SOUND_TOGGLE_TOP_GAP },
          ]}
        >
          <Pressable
            style={styles.soundToggleButton}
            accessibilityRole="button"
            accessibilityLabel={
              isMuted ? APP_INTRO_UI.ENABLE_SOUND : APP_INTRO_UI.DISABLE_SOUND
            }
            accessibilityState={{ checked: !isMuted }}
            onPress={() => setIsMuted((value) => !value)}
          >
            <MaterialIcons
              name={isMuted ? "volume-off" : "volume-up"}
              size={20}
              color={theme.colors.onContrast}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
