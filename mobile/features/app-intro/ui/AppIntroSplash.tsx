import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import { resolveAppIntroPlaybackConfig } from "@/entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig";
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

  const playbackConfig = useMemo(() => {
    const response = settingsQuery.data;
    const paidIntro = response?.paidIntro;
    const activeSettings = previewSettings ?? paidIntro ?? response?.settings ?? null;

    return resolveAppIntroPlaybackConfig(activeSettings, {
      isPaidIntro: Boolean(paidIntro) && !previewSettings,
      advertiserId: paidIntro?.advertiserId ?? null,
      ctaType: paidIntro?.ctaType ?? null,
    });
  }, [previewSettings, settingsQuery.data]);

  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const openedAtRef = useRef(Date.now());
  const dismissedRef = useRef(false);
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeDismiss = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    if (minTimerRef.current) {
      clearTimeout(minTimerRef.current);
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
    }
    onDismiss();
  }, [onDismiss]);

  const dismissAfterMinDuration = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    const elapsed = Date.now() - openedAtRef.current;
    const waitMs = Math.max(0, playbackConfig.minMs - elapsed);
    if (waitMs === 0) {
      completeDismiss();
      return;
    }
    minTimerRef.current = setTimeout(completeDismiss, waitMs);
  }, [completeDismiss, playbackConfig.minMs]);

  useEffect(() => {
    maxTimerRef.current = setTimeout(completeDismiss, playbackConfig.maxMs);
    return () => {
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current);
      }
      if (minTimerRef.current) {
        clearTimeout(minTimerRef.current);
      }
    };
  }, [completeDismiss, playbackConfig.maxMs]);

  const hasVideo = Boolean(playbackConfig.videoMp4Src) && !videoFailed;

  return (
    <View style={styles.overlay}>
      {hasVideo ? (
        <LoopingCoverVideo
          uri={playbackConfig.videoMp4Src}
          loop={false}
          isMuted={isMuted}
          onPlaybackFailed={() => {
            setVideoFailed(true);
            dismissAfterMinDuration();
          }}
          onEnded={dismissAfterMinDuration}
          style={styles.video}
        />
      ) : playbackConfig.posterSrc ? (
        <Image source={{ uri: playbackConfig.posterSrc }} style={styles.video} resizeMode="cover" />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>{playbackConfig.fallbackTitle}</Text>
          <Text style={styles.fallbackHint}>{playbackConfig.fallbackHint}</Text>
        </View>
      )}

      <View style={styles.controls}>
        {hasVideo ? (
          <Pressable onPress={() => setIsMuted((value) => !value)}>
            <Text style={styles.controlText}>
              {isMuted ? APP_INTRO_UI.ENABLE_SOUND : APP_INTRO_UI.DISABLE_SOUND}
            </Text>
          </Pressable>
        ) : null}
        <Pressable onPress={completeDismiss}>
          <Text style={styles.controlText}>{APP_INTRO_UI.SKIP}</Text>
        </Pressable>
      </View>

      {playbackConfig.isPaidIntro ? (
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>{APP_INTRO_UI.AD_BADGE}</Text>
        </View>
      ) : null}
    </View>
  );
};

export const AppIntroSplash = () => {
  const { isIntroVisible, dismissIntro } = useAppIntro();

  if (!isIntroVisible) {
    return null;
  }

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={dismissIntro}>
      <AppIntroSplashContent onDismiss={dismissIntro} />
    </Modal>
  );
};
