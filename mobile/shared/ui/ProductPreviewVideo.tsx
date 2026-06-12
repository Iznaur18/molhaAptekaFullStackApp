import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

type ProductPreviewVideoProps = {
  uri: string;
  onPlaybackFailed?: () => void;
};

export const ProductPreviewVideo = ({ uri, onPlaybackFailed }: ProductPreviewVideoProps) => {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  useEffect(() => {
    if (status === "error") {
      onPlaybackFailed?.();
    }
  }, [status, onPlaybackFailed]);

  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
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
