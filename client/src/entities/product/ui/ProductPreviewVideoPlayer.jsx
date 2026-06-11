import { useState } from "react";

import { resolvePreviewVideoMimeType } from "../../../shared/lib/resolvePreviewVideoMimeType.js";
import { useProductPreviewVideoPlayback } from "../lib/useProductPreviewVideoPlayback.js";

import "./ProductPreviewVideoPlayer.css";

/**
 * @param {{
 *   src: string;
 *   className?: string;
 *   playWhenVisible?: boolean;
 *   playbackEnabled?: boolean;
 *   onPlaybackFailed?: () => void;
 * }} props
 */
export function ProductPreviewVideoPlayer({
  src,
  className = "",
  playWhenVisible = true,
  playbackEnabled = true,
  onPlaybackFailed,
}) {
  const [failed, setFailed] = useState(false);
  const { containerRef, videoRef } = useProductPreviewVideoPlayback({
    enabled: !failed && playbackEnabled,
    playWhenVisible,
  });

  if (failed) {
    return null;
  }

  const handleError = () => {
    setFailed(true);
    onPlaybackFailed?.();
  };

  return (
    <div
      ref={containerRef}
      className={["product-preview-video", className].filter(Boolean).join(" ")}
    >
      <video
        ref={videoRef}
        className="product-preview-video__el"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onError={handleError}
      >
        <source src={src} type={resolvePreviewVideoMimeType(src)} />
      </video>
    </div>
  );
}
