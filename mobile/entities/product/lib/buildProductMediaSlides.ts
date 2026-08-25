import { isDisplayableMediaUrl } from "@/shared/lib";

export type ProductMediaSlide =
  | { type: "video"; url: string }
  | { type: "image"; url: string };

export const buildProductMediaSlides = ({
  previewVideoUrl,
  imageUrls,
}: {
  previewVideoUrl: string | null;
  imageUrls: string[];
}): ProductMediaSlide[] => {
  const slides: ProductMediaSlide[] = [];
  const video = previewVideoUrl?.trim();

  if (video) {
    slides.push({ type: "video", url: video });
  }

  for (const raw of imageUrls) {
    const url = String(raw ?? "").trim();
    if (isDisplayableMediaUrl(url)) {
      slides.push({ type: "image", url });
    }
  }

  return slides;
};

/**
 * Индекс фото среди фото — из индекса слайда, где первым может стоять видео.
 * Порт `resolveProductImageIndexForLightbox` из веба.
 */
export const resolveProductImageIndexForLightbox = (
  slides: ProductMediaSlide[],
  slideIndex: number,
): number => {
  let imageIndex = 0;
  for (let i = 0; i < slideIndex && i < slides.length; i += 1) {
    if (slides[i]?.type === "image") {
      imageIndex += 1;
    }
  }
  return imageIndex;
};
