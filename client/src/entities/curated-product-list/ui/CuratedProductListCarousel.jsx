import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX,
  CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX,
} from "../lib/curatedProductListHomeLayout.js";
import { useCuratedCarouselImageDragScroll } from "../lib/useCuratedCarouselImageDragScroll.js";
import { CuratedProductCompactCard } from "./CuratedProductCompactCard.jsx";

import "./CuratedProductListCarousel.css";

/**
 * @param {{
 *   title: string;
 *   products: import('../../product/model/types.js').ProductFromApi[];
 *   onOpenProduct: (product: import('../../product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function CuratedProductListCarousel({ title, products, onOpenProduct }) {
  const { ref: scrollRef, dragScrollProps } = useCuratedCarouselImageDragScroll();

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="curated-product-list-carousel"
      aria-label={title}
      style={{
        "--curated-visible-cards": String(CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX),
        "--curated-card-gap": `${CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX}px`,
        "--curated-card-min-width": `${CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX}px`,
        "--curated-card-max-width": `${CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX}px`,
      }}
    >
      <h2 className="curated-product-list-carousel__title">{title}</h2>
      <div
        ref={scrollRef}
        className="curated-product-list-carousel__scroll"
        {...dragScrollProps}
      >
        {products.map((product) => (
          <CuratedProductCompactCard
            key={product._id}
            product={product}
            onOpen={onOpenProduct}
          />
        ))}
      </div>
    </section>
  );
}
