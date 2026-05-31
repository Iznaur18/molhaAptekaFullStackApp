import { ProductPreviewVideoPlayer } from "./ProductPreviewVideoPlayer.jsx";

/**
 * @param {{
 *   slide: import('../lib/buildProductMediaSlides.js').ProductMediaSlide | null;
 *   playVideoWhenVisible?: boolean;
 *   onVideoFailed?: () => void;
 *   imageClassName?: string;
 *   onImageError?: () => void;
 * }} props
 */
export function ProductMediaSlideContent({
  slide,
  playVideoWhenVisible = true,
  onVideoFailed,
  imageClassName = "",
  onImageError,
}) {
  if (slide == null) {
    return null;
  }

  if (slide.type === "video") {
    return (
      <ProductPreviewVideoPlayer
        src={slide.url}
        playWhenVisible={playVideoWhenVisible}
        onPlaybackFailed={onVideoFailed}
      />
    );
  }

  return (
    <img
      className={imageClassName}
      src={slide.url}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={onImageError}
    />
  );
}
