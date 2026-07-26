import { useState } from "react";

import { resolveProductCatalogPriceRub } from "../../product/lib/resolveProductCatalogPriceRub.js";
import { resolveProductImageUrl } from "../../product/lib/resolveProductImageUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import { CURATED_PRODUCT_COMPACT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./CuratedProductCompactCard.css";

/**
 * @param {{
 *   product: import('../../product/model/types.js').ProductFromApi;
 *   onOpen: (product: import('../../product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function CuratedProductCompactCard({ product, onOpen }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveProductImageUrl(product);
  const imageUrl = failed || !resolved ? PRODUCT_IMAGE_PLACEHOLDER_URL : resolved;
  const priceLabel = formatPriceRub(resolveProductCatalogPriceRub(product));

  return (
    <article className="curated-product-compact-card">
      <div className="curated-product-compact-card__image-wrap">
        <img
          className="curated-product-compact-card__image"
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
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
