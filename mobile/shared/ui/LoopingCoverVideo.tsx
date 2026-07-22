import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type LoopingCoverVideoProps = {
  uri: string;
  loop?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  onPlaybackFailed?: () => void;
  onReady?: () => void;
  onEnded?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const LoopingCoverVideo = ({
  uri,
  loop = true,
  isMuted = true,
  isPlaying = true,
  onPlaybackFailed,
  onReady,
  onEnded,
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
  }, [isMuted, player]);

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
      contentFit="cover"
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
