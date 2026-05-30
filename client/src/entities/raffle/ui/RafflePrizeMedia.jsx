import { useMemo } from "react";

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
 * }} props
 */
export function RafflePrizeMedia({
  raffle,
  className = "",
  imageClassName = "",
  videoClassName = "",
  autoplayVideo = true,
}) {
  const isVideo = isRafflePrizeVideo(raffle);
  const imageSrc = useMemo(() => resolveRafflePrizeImageUrl(raffle), [raffle]);
  const videoSrc = useMemo(() => resolveRafflePrizeVideoUrl(raffle), [raffle]);
  const objectPosition = useMemo(
    () => formatRafflePrizeImageObjectPosition(raffle),
    [raffle],
  );

  if (isVideo && videoSrc) {
    return (
      <video
        className={[className, videoClassName].filter(Boolean).join(" ")}
        src={videoSrc}
        autoPlay={autoplayVideo}
        loop
        muted
        playsInline
        preload="metadata"
      />
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
