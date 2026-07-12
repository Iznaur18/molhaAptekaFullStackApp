import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import {
  resolveAppIntroPlaybackConfig,
  type AppIntroPlaybackConfig,
} from "@/entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig";
import { appIntroSettingsQueryKeys } from "@/entities/app-intro-settings/model/types";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { APP_INTRO_UI } from "@/shared/config";
import { useAppIntroSplashStyles } from "@/shared/theme/sellerFlowStyles";
import { LoopingCoverVideo } from "@/shared/ui/LoopingCoverVideo";

type AppIntroSplashContentProps = {
  onDismiss: () => void;
};

const AppIntroSplashContent = ({ onDismiss }: AppIntroSplashContentProps) => {
  const styles = useAppIntroSplashStyles();
  const { previewSettings } = useAppIntro();
  const settingsQuery = useQuery({
    queryKey: appIntroSettingsQueryKeys.public(),
    queryFn: fetchAppIntroSettings,
    staleTime: 60_000,
  });

  // Плейлист интро: платформенное видео админа (если есть) → до 5 платных роликов подряд.
  const playlist = useMemo<AppIntroPlaybackConfig[]>(() => {
    if (previewSettings) {
      return [resolveAppIntroPlaybackConfig(previewSettings, { isPaidIntro: false })];
    }

    const response = settingsQuery.data;
    const paidIntros = response?.paidIntros ?? [];

    const items: AppIntroPlaybackConfig[] = [];

    // Платформенное интро админа идёт первым — только если у него есть видео или постер.
    const platformConfig = resolveAppIntroPlaybackConfig(response?.settings ?? null, {
      isPaidIntro: false,
    });
    const platformHasMedia = Boolean(platformConfig.videoMp4Src || platformConfig.posterSrc);
    if (platformHasMedia) {
      items.push(platformConfig);
    }

    // Затем — платные ролики рекламодателей, по очереди.
    for (const intro of paidIntros) {
      items.push(
        resolveAppIntroPlaybackConfig(intro, {
          isPaidIntro: true,
          advertiserId: intro.advertiserId,
          ctaType: intro.ctaType,
        }),
      );
    }

    // Ничего нет — запасной экран платформенного интро.
    if (items.length === 0) {
      items.push(platformConfig);
    }

    return items;
  }, [previewSettings, settingsQuery.data]);

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const dismissedRef = useRef(false);

  const current = playlist[index] ?? null;

  const completeDismiss = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    onDismiss();
  }, [onDismiss]);

  // Переход к следующему ролику; после последнего — закрытие интро.
  const advance = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    const nextIndex = indexRef.current + 1;
    if (nextIndex >= playlist.length) {
      completeDismiss();
      return;
    }
    indexRef.current = nextIndex;
    setIndex(nextIndex);
  }, [completeDismiss, playlist.length]);

  // Страховочный таймер на каждый ролик отдельно — на случай зависшего видео.
  useEffect(() => {
    if (!current) {
      completeDismiss();
      return;
    }
    setVideoFailed(false);
    const timer = setTimeout(advance, current.maxMs);
    return () => clearTimeout(timer);
  }, [advance, completeDismiss, current, index]);

  const handlePlaybackFailed = useCallback(() => {
    // Битый платный ролик пропускаем сразу; платформенное/превью интро
    // показывает постер или запасной экран до страховочного таймера.
    if (current?.isPaidIntro) {
      advance();
      return;
    }
    setVideoFailed(true);
  }, [advance, current?.isPaidIntro]);

  const hasVideo = Boolean(current?.videoMp4Src) && !videoFailed;

  return (
    <View style={styles.overlay}>
      {hasVideo && current ? (
        <LoopingCoverVideo
          key={index}
          uri={current.videoMp4Src}
          loop={false}
          isMuted={isMuted}
          onPlaybackFailed={handlePlaybackFailed}
          onEnded={advance}
          style={styles.video}
        />
      ) : current?.posterSrc ? (
        <Image source={{ uri: current.posterSrc }} style={styles.video} resizeMode="cover" />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>{current?.fallbackTitle}</Text>
          <Text style={styles.fallbackHint}>{current?.fallbackHint}</Text>
        </View>
      )}

      {hasVideo ? (
        <View style={styles.controls}>
          <Pressable onPress={() => setIsMuted((value) => !value)}>
            <Text style={styles.controlText}>
              {isMuted ? APP_INTRO_UI.ENABLE_SOUND : APP_INTRO_UI.DISABLE_SOUND}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {current?.isPaidIntro ? (
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>{APP_INTRO_UI.AD_BADGE}</Text>
        </View>
      ) : null}
    </View>
  );
};

// Интро нельзя пропустить: системная кнопка «Назад» (Android) не закрывает показ.
const preventBackDismiss = () => {};

export const AppIntroSplash = () => {
  const { isIntroVisible, dismissIntro } = useAppIntro();

  if (!isIntroVisible) {
    return null;
  }

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={preventBackDismiss}>
      <AppIntroSplashContent onDismiss={dismissIntro} />
    </Modal>
  );
};
