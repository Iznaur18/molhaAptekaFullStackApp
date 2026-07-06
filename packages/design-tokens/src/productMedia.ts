/** width / height — единый кадр фото товара (карточка, детали, create). */
export const PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO = 1;

export const resolveProductMediaDisplayHeight = (
  containerWidth: number,
  aspectRatio: number = PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
): number => {
  if (containerWidth <= 0 || aspectRatio <= 0) {
    return 0;
  }

  return containerWidth / aspectRatio;
};
