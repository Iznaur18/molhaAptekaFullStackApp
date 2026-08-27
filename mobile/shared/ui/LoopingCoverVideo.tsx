import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type LoopingCoverVideoProps = {
  uri: string;
  loop?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  contentFit?: "cover" | "contain";
  onPlaybackFailed?: () => void;
  onReady?: () => void;
  onEnded?: () => void;
  onUnmuteRejected?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const LoopingCoverVideo = ({
  uri,
  loop = true,
  isMuted = true,
  isPlaying = true,
  contentFit = "cover",
  onPlaybackFailed,
  onReady,
  onEnded,
  onUnmuteRejected,
  style,
}: LoopingCoverVideoProps) => {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = loop;
    instance.muted = isMuted;
    if (isPlaying) {
      instance.play();
    }
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  useEffect(() => {
    player.muted = isMuted;
    if (isMuted || !isPlaying) {
      return;
    }

    try {
      const playResult = player.play() as void | Promise<void>;
      if (playResult != null && typeof (playResult as Promise<void>).catch === "function") {
        void (playResult as Promise<void>).catch(() => {
          player.muted = true;
          onUnmuteRejected?.();
        });
      }
    } catch {
      player.muted = true;
      onUnmuteRejected?.();
    }
  }, [isMuted, isPlaying, onUnmuteRejected, player]);

  useEffect(() => {
    if (isPlaying) {
      player.play();
      return;
    }
    player.pause();
  }, [isPlaying, player]);

  useEffect(() => {
    if (status === "error") {
      onPlaybackFailed?.();
      return;
    }
    if (status === "readyToPlay") {
      onReady?.();
    }
  }, [status, onPlaybackFailed, onReady]);

  useEffect(() => {
    if (!onEnded) {
      return undefined;
    }

    const subscription = player.addListener("playToEnd", onEnded);
    return () => subscription.remove();
  }, [onEnded, player]);

  return (
    <VideoView
      player={player}
      style={[styles.video, style]}
      contentFit={contentFit}
      nativeControls={false}
      allowsPictureInPicture={false}
      pointerEvents="none"
      {...(Platform.OS === "android" ? { surfaceType: "textureView" as const } : {})}
    />
  );
};

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
  },
});
