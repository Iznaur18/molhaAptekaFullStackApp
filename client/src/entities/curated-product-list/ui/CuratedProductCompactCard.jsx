import { resolveProductCatalogPriceRub } from "../../product/lib/resolveProductCatalogPriceRub.js";
import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { CURATED_PRODUCT_COMPACT_CARD_UI } from "../../../shared/config/appUiCopy.js";

import "./CuratedProductCompactCard.css";

/**
 * @param {{
 *   product: import('../../product/model/types.js').ProductFromApi;
 *   onOpen: (product: import('../../product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function CuratedProductCompactCard({ product, onOpen }) {
  const imageUrls = resolveProductImageUrls(product);
  const imageUrl = imageUrls[0] ?? "";
  const priceLabel = formatPriceRub(resolveProductCatalogPriceRub(product));

  return (
    <article className="curated-product-compact-card">
      <div className="curated-product-compact-card__image-wrap">
        {imageUrl ? (
          <img
            className="curated-product-compact-card__image"
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <span className="curated-product-compact-card__image-fallback" aria-hidden="true">
            {CURATED_PRODUCT_COMPACT_CARD_UI.NO_IMAGE}
          </span>
        )}
      </div>
      <button
        type="button"
        className="curated-product-compact-card__price-wrap"
        onClick={() => onOpen(product)}
        aria-label={CURATED_PRODUCT_COMPACT_CARD_UI.OPEN_ARIA(product.productName)}
      >
        <span className="curated-product-compact-card__price">{priceLabel}</span>
      </button>
    </article>
  );
}
