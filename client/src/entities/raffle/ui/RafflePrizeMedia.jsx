import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { RAFFLE_PRIZE_MEDIA_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { formatRafflePrizeImageObjectPosition } from "../lib/rafflePrizeImageFocus.js";
import { isRafflePrizeVideo } from "../lib/isRafflePrizeVideo.js";
import { resolveRafflePrizeImageUrl } from "../lib/resolveRafflePrizeImageUrl.js";
import { resolveRafflePrizeVideoUrl } from "../lib/resolveRafflePrizeVideoUrl.js";

import "./RafflePrizeMedia.css";

/**
 * @param {{
 *   raffle: import('../model/types.js').RaffleFromApi;
 *   className?: string;
 *   imageClassName?: string;
 *   videoClassName?: string;
 *   autoplayVideo?: boolean;
 *   showSoundToggle?: boolean;
 *   isVideoActive?: boolean;
 * }} props
 */
export function RafflePrizeMedia({
  raffle,
  className = "",
  imageClassName = "",
  videoClassName = "",
  autoplayVideo = true,
  showSoundToggle = false,
  isVideoActive = true,
}) {
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const [isMuted, setIsMuted] = useState(true);

  const isVideo = isRafflePrizeVideo(raffle);
  const imageSrc = useMemo(() => resolveRafflePrizeImageUrl(raffle), [raffle]);
  const videoSrc = useMemo(() => resolveRafflePrizeVideoUrl(raffle), [raffle]);
  const objectPosition = useMemo(
    () => formatRafflePrizeImageObjectPosition(raffle),
    [raffle],
  );
  const shouldPlay = autoplayVideo && isVideoActive;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || !videoSrc) {
      return;
    }

    if (shouldPlay) {
      void video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [isVideo, shouldPlay, videoSrc]);

  const handleToggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
      });
    }
  };

  const stopPointerBubble = (event) => {
    event.stopPropagation();
  };

  if (isVideo && videoSrc) {
    const videoClassNames = [className, videoClassName].filter(Boolean).join(" ");

    if (!showSoundToggle) {
      return (
        <video
          ref={videoRef}
          className={videoClassNames}
          src={videoSrc}
          autoPlay={shouldPlay}
          loop
          muted
          playsInline
          preload="metadata"
        />
      );
    }

    return (
      <div
        className={["raffle-prize-media__video-wrap", videoClassNames]
          .filter(Boolean)
          .join(" ")}
      >
        <video
          ref={videoRef}
          className="raffle-prize-media raffle-prize-media_video"
          src={videoSrc}
          autoPlay={shouldPlay}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
        />
        <button
          type="button"
          className="raffle-prize-media__sound-btn"
          aria-label={RAFFLE_PRIZE_MEDIA_UI.SOUND_TOGGLE_ARIA(isMuted)}
          aria-pressed={!isMuted}
          onClick={handleToggleSound}
          onPointerDown={stopPointerBubble}
          onPointerMove={stopPointerBubble}
          onPointerUp={stopPointerBubble}
        >
          <AppIcon icon={isMuted ? VolumeX : Volume2} size="sm" />
        </button>
      </div>
    );
  }

  if (!imageSrc) {
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt=""
      className={[className, imageClassName].filter(Boolean).join(" ")}
      loading="lazy"
      style={{ objectPosition }}
    />
  );
}
