import { createElement, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { resolvePreviewVideoMimeType } from "@/shared/lib/resolvePreviewVideoMimeType";

type ProductPreviewVideoProps = {
  uri: string;
  onPlaybackFailed?: () => void;
};

/**
 * Web: `<video>` перехватывает pointer events на Android tablet —
 * `pointerEvents: none`, чтобы тап открывал карточку товара.
 */
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
    video.muted = true;
    video.loop = true;
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [uri, onPlaybackFailed]);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {createElement(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          preload: "metadata",
          style: styles.video,
        },
        createElement("source", {
          src: uri,
          type: resolvePreviewVideoMimeType(uri),
        }),
      )}
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
    pointerEvents: "none",
  },
});
