/** Высота фиксированного purchase-dock (без нижнего таббара — экран вне `(tabs)`). */
export const PRODUCT_DETAIL_DOCK_SCROLL_PADDING = 100;

export type ProductDetailHeroSize = {
  width: "100%";
  aspectRatio: 1;
  alignSelf: "stretch";
};

/** Квадрат на всю ширину контентной колонки (родитель). */
export const resolveProductDetailHeroSize = (): ProductDetailHeroSize => ({
  width: "100%",
  aspectRatio: 1,
  alignSelf: "stretch",
});
