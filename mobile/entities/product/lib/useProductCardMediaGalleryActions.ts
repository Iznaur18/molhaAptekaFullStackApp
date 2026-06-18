import type { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";

type ProductCardMediaState = ReturnType<typeof useProductCardMediaState>;

export const resolvePreviousSlideIndex = (index: number, slideCount: number) => {
  if (slideCount <= 1) {
    return index;
  }
  return (index - 1 + slideCount) % slideCount;
};

export const resolveNextSlideIndex = (index: number, slideCount: number) => {
  if (slideCount <= 1) {
    return index;
  }
  return (index + 1) % slideCount;
};

export const useProductCardMediaGalleryActions = (media: ProductCardMediaState) => {
  const slideCount = media.mediaSlides.length;
  const hasMultipleSlides = slideCount > 1;

  const goToPreviousSlide = () => {
    media.setCardSlideIndex((index) => resolvePreviousSlideIndex(index, slideCount));
  };

  const goToNextSlide = () => {
    media.setCardSlideIndex((index) => resolveNextSlideIndex(index, slideCount));
  };

  return {
    hasMultipleSlides,
    slideCount,
    goToPreviousSlide,
    goToNextSlide,
  };
};
