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
    <>
      <h2 className="curated-product-list-carousel__title">{title}</h2>
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
        <div
          ref={scrollRef}
          className="curated-product-list-carousel__scroll"
          {...dragScrollProps}
        >
          <ul className="curated-product-list-carousel__track" role="list">
            {products.map((product) => (
              <li key={product._id} className="curated-product-list-carousel__item">
                <CuratedProductCompactCard
                  product={product}
                  onOpen={onOpenProduct}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
