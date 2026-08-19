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
  blurVideoBackground = false,
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
          draggable={false}
        />
      );
    }

    return (
      <div
        className={["raffle-prize-media__video-wrap", videoClassNames]
          .filter(Boolean)
          .join(" ")}
      >
        {blurVideoBackground ? (
          <video
            className="raffle-prize-media raffle-prize-media_video raffle-prize-media__video-bg"
            src={videoSrc}
            autoPlay={shouldPlay}
            loop
            muted
            playsInline
            preload="metadata"
            draggable={false}
            aria-hidden="true"
          />
        ) : null}
        <video
          ref={videoRef}
          className={[
            "raffle-prize-media raffle-prize-media_video raffle-prize-media__video-fg",
            videoClassNames,
          ]
            .filter(Boolean)
            .join(" ")}
          src={videoSrc}
          autoPlay={shouldPlay}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          draggable={false}
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
    <div
      className={["raffle-prize-media__image-wrap", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={imageSrc}
        alt=""
        className="raffle-prize-media raffle-prize-media__image-bg"
        loading="lazy"
        draggable={false}
        style={{ objectPosition }}
        aria-hidden="true"
      />
      <img
        src={imageSrc}
        alt=""
        className={["raffle-prize-media raffle-prize-media__image-fg", imageClassName, className]
          .filter(Boolean)
          .join(" ")}
        loading="lazy"
        draggable={false}
        style={{ objectPosition }}
      />
    </div>
  );
}

