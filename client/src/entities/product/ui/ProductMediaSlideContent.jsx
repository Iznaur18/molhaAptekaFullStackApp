import { useEffect, useRef, useState } from "react";

import { ProductPreviewVideoPlayer } from "./ProductPreviewVideoPlayer.jsx";

import "./ProductMediaSlideContent.css";

/**
 * @param {{
 *   slide: import('../lib/buildProductMediaSlides.js').ProductMediaSlide | null;
 *   playVideoWhenVisible?: boolean;
 *   onVideoFailed?: () => void;
 *   imageClassName?: string;
 *   onImageError?: () => void;
 *   loading?: 'lazy' | 'eager';
 *   blurBackdrop?: boolean;
 * }} props
 */
export function ProductMediaSlideContent({
  slide,
  playVideoWhenVisible = true,
  onVideoFailed,
  imageClassName = "",
  onImageError,
  loading = "lazy",
  blurBackdrop = false,
}) {
  const imgRef = useRef(/** @type {HTMLImageElement | null} */ (null));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [slide?.url]);

  useEffect(() => {
    const img = imgRef.current;
    if (img != null && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [slide?.url]);

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

  const image = (
    <img
      ref={imgRef}
      className={[
        imageClassName,
        "product-media-slide-content__image",
        isLoaded ? "product-media-slide-content__image--loaded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      src={slide.url}
      alt=""
      loading={loading}
      decoding="async"
      draggable={false}
      onLoad={() => {
        setIsLoaded(true);
      }}
      onError={onImageError}
    />
  );

  if (!blurBackdrop) {
    return image;
  }

  return (
    <div className="product-media-slide-content product-media-slide-content--blur-backdrop">
      <img
        className={[
          "product-media-slide-content__blur",
          isLoaded ? "product-media-slide-content__blur--loaded" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        src={slide.url}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
        draggable={false}
      />
      {image}
    </div>
  );
}
