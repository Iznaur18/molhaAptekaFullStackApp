import { useState } from "react";

import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import { resolveOrderLineItemProductImageUrl } from "../lib/resolveOrderLineItemProductImageUrl.js";
import { isOrderLineItemProductClickable } from "../lib/resolveOrderLineItemProductName.js";

/**
 * @param {{
 *   item: import("../model/types.js").OrderLineItem;
 *   productName: string;
 *   onProductClick?: (item: import("../model/types.js").OrderLineItem) => void;
 * }} props
 */
export function OrderCardLineItemThumb({ item, productName, onProductClick }) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? PRODUCT_IMAGE_PLACEHOLDER_URL
    : resolveOrderLineItemProductImageUrl(item);
  const isClickable =
    isOrderLineItemProductClickable(item) && typeof onProductClick === "function";

  const image = (
    <img
      className="order-card__item-thumb-image"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className="order-card__item-thumb order-card__item-thumb_button"
        onClick={() => onProductClick(item)}
        aria-label={productName}
      >
        {image}
      </button>
    );
  }

  return <div className="order-card__item-thumb">{image}</div>;
}
