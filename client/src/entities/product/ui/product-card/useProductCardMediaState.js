import { useEffect, useMemo, useState } from "react";

import { resolveProductImageUrls } from "../../lib/resolveProductImageUrls.js";
import { buildProductMediaSlides } from "../../lib/buildProductMediaSlides.js";
import { resolveProductPreviewVideoUrl } from "../../lib/resolveProductPreviewVideoUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../model/productConstants.js";

/**
 * @param {import('../../model/types.js').ProductFromApi} product
 */
export function useProductCardMediaState(product) {
  const galleryUrls = useMemo(() => resolveProductImageUrls(product), [product]);
  const previewVideoUrl = useMemo(
    () => resolveProductPreviewVideoUrl(product),
    [product],
  );

  const [cardSlideIndex, setCardSlideIndex] = useState(0);
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    const slides = buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls: galleryUrls,
    });
    if (!slides.some((slide) => slide.type === "image")) {
      slides.push({ type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL });
    }
    return slides;
  }, [galleryUrls, previewVideoUrl, previewVideoFailed]);

  const activeSlide = mediaSlides[cardSlideIndex] ?? null;

  useEffect(() => {
    setCardSlideIndex(0);
  }, [product._id]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [product._id, previewVideoUrl]);

  useEffect(() => {
    setCardSlideIndex((index) => Math.min(index, Math.max(0, mediaSlides.length - 1)));
  }, [mediaSlides.length]);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [activeSlide, product._id]);

  const renderedSlide =
    activeSlide?.type === "image" && useFallbackImage
      ? { type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL }
      : activeSlide;

  return {
    mediaSlides,
    cardSlideIndex,
    setCardSlideIndex,
    renderedSlide,
    setPreviewVideoFailed,
    setUseFallbackImage,
    useFallbackImage,
  };
}
