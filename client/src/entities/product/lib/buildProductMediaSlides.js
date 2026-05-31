/**
 * @typedef {{ type: 'video', url: string } | { type: 'image', url: string }} ProductMediaSlide
 */

/**
 * Слайды карточки/деталей: превью-видео (если есть), затем фото.
 *
 * @param {{
 *   previewVideoUrl: string | null;
 *   imageUrls: string[];
 * }} params
 * @returns {ProductMediaSlide[]}
 */
export function buildProductMediaSlides({ previewVideoUrl, imageUrls }) {
  /** @type {ProductMediaSlide[]} */
  const slides = [];
  const video = previewVideoUrl?.trim();
  if (video) {
    slides.push({ type: "video", url: video });
  }
  for (const raw of imageUrls) {
    const url = String(raw ?? "").trim();
    if (/^https?:\/\//i.test(url)) {
      slides.push({ type: "image", url });
    }
  }
  return slides;
}

/**
 * @param {ProductMediaSlide[]} slides
 * @param {number} slideIndex
 * @returns {number}
 */
export function resolveProductImageIndexForLightbox(slides, slideIndex) {
  let imageIndex = 0;
  for (let i = 0; i < slideIndex && i < slides.length; i += 1) {
    if (slides[i].type === "image") {
      imageIndex += 1;
    }
  }
  return imageIndex;
}
