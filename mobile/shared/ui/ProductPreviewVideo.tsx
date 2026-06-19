import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

type ProductPreviewVideoProps = {
  uri: string;
  loop?: boolean;
  onPlaybackFailed?: () => void;
  onReady?: () => void;
  onEnded?: () => void;
};

export const ProductPreviewVideo = ({
  uri,
  loop = true,
  onPlaybackFailed,
  onReady,
  onEnded,
}: ProductPreviewVideoProps) => {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = loop;
    instance.muted = true;
    instance.play();
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

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
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
      surfaceType="textureView"
    />
  );
};

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
  },
});
