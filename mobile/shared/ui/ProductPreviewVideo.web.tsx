import { createElement, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

type ProductPreviewVideoProps = {
  uri: string;
  onPlaybackFailed?: () => void;
};

export const ProductPreviewVideo = ({ uri, onPlaybackFailed }: ProductPreviewVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleError = () => {
      onPlaybackFailed?.();
    };

    video.addEventListener("error", handleError);
    void video.play().catch(() => {
      onPlaybackFailed?.();
    });

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [uri, onPlaybackFailed]);

  return (
    <View style={styles.wrap}>
      {createElement("video", {
        ref: videoRef,
        src: uri,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style: styles.video,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});
