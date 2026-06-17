import { useEffect, useMemo, useState } from "react";

import { buildProductMediaSlides } from "@/entities/product/lib/buildProductMediaSlides";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductPreviewVideoUrl } from "@/entities/product/lib/resolveProductPreviewVideoUrl";

type ProductCardMediaProduct = {
  _id: string;
  productImageUrls?: unknown;
  productImageUrl?: unknown;
  productPreviewVideoUrl?: unknown;
};

export const useProductCardMediaState = (product: ProductCardMediaProduct) => {
  const galleryUrls = useMemo(() => resolveProductImageUrls(product), [product]);
  const previewVideoUrl = useMemo(
    () => resolveProductPreviewVideoUrl(product),
    [product],
  );

  const [cardSlideIndex, setCardSlideIndex] = useState(0);
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;

    return buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls: galleryUrls,
    });
  }, [galleryUrls, previewVideoFailed, previewVideoUrl]);

  const activeSlide = mediaSlides[cardSlideIndex] ?? null;

  useEffect(() => {
    setCardSlideIndex(0);
  }, [product._id]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [previewVideoUrl, product._id]);

  useEffect(() => {
    setCardSlideIndex((index) => Math.min(index, Math.max(0, mediaSlides.length - 1)));
  }, [mediaSlides.length]);

  return {
    mediaSlides,
    cardSlideIndex,
    setCardSlideIndex,
    activeSlide,
    setPreviewVideoFailed,
  };
};
