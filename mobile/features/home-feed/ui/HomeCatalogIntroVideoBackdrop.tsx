import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIntroBackdropPlaylist } from "@/entities/app-intro-settings/model/useIntroBackdropPlaylist";
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

const POSTER_ADVANCE_FALLBACK_MS = 6000;

export type HomeCatalogIntroVideoBackdropProps = {
  /** false — лента закрыла hero; декодер видео на паузе. */
  playbackActive?: boolean;
};

/**
 * Hero-шапка ленты: фоновый плейлист intro-роликов (видео админа → платные
 * ролики) без звука по умолчанию, крутится по кругу. Каждый ролик играет до
 * конца, затем следующий; после последнего — снова первый. Toggle звука в
 * правом верхнем углу. Обычный блок в потоке FlatList — скроллится с контентом.
 */
export const HomeCatalogIntroVideoBackdrop = ({
  playbackActive = true,
}: HomeCatalogIntroVideoBackdropProps) => {
  const styles = useHomeCatalogBackdropStyles();
  const { theme } = useAppThemeSettings();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const height = resolveHomeCatalogIntroBackdropHeight(windowHeight);
  const { playlist } = useIntroBackdropPlaylist();
  const [index, setIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  const isSingle = playlist.length <= 1;
  const current = playlist.length > 0 ? playlist[index % playlist.length] : null;

  const hasVideo = Boolean(current?.videoMp4Src) && !videoFailed;
  const posterSrc = current?.posterSrc ?? null;
  const showPoster = Boolean(posterSrc) && !hasVideo;

  const advance = useCallback(() => {
    setVideoFailed(false);
    setIndex((value) => (playlist.length > 0 ? (value + 1) % playlist.length : 0));
  }, [playlist.length]);

  // Постер/запасной кадр сам не даёт события конца — прокручиваем по таймеру.
  // Видео листается по onEnded, поэтому здесь таймер не ставим.
  useEffect(() => {
    if (isSingle || hasVideo) {
      return;
    }
    const ms = current?.maxMs && current.maxMs > 0 ? current.maxMs : POSTER_ADVANCE_FALLBACK_MS;
    const timer = setTimeout(advance, ms);
    return () => clearTimeout(timer);
  }, [advance, current, hasVideo, isSingle]);

  const handlePlaybackFailed = useCallback(() => {
    if (isSingle) {
      setVideoFailed(true);
      return;
    }
    advance();
  }, [advance, isSingle]);

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

      {hasVideo && current ? (
        <LoopingCoverVideo
          key={index}
          uri={current.videoMp4Src}
          loop={isSingle}
          isMuted={isMuted}
          isPlaying={playbackActive}
          onPlaybackFailed={handlePlaybackFailed}
          onEnded={isSingle ? undefined : advance}
          style={styles.media}
        />
      ) : null}

      {showPoster ? (
        <View pointerEvents="none" style={styles.media}>
          <Image
            source={{ uri: posterSrc! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
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
