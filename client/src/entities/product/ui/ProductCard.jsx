import { useEffect, useMemo, useState } from "react";

import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import {
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  PRODUCT_MODEL_FIELD_KEYS,
} from "../model/productConstants.js";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductCard.css";

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * @param {object} props
 * @param {import('../model/types.js').ProductFromApi} props.product
 * @param {(userId: string) => void} [props.onSellerNameClick]
 */
export function ProductCard({ product, onSellerNameClick }) {
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const primaryImageUrl = useMemo(
    () =>
      isAbsoluteHttpUrl(product.productImageUrl)
        ? product.productImageUrl.trim()
        : null,
    [product.productImageUrl],
  );
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
    setUseFallbackImage(primaryImageUrl == null);
  }, [primaryImageUrl, product._id]);

  const imageUrl = useFallbackImage
    ? PRODUCT_IMAGE_PLACEHOLDER_URL
    : primaryImageUrl;

  const handleImageError = () => {
    if (!useFallbackImage) {
      setUseFallbackImage(true);
      return;
    }
    setImageLoadFailed(true);
  };

  return (
    <article className="product-card" aria-label={heading}>
      {imageUrl && !imageLoadFailed ? (
        <img
          className="product-card__image"
          src={imageUrl}
          alt={heading}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      ) : null}
      <h2 className="product-card__heading">{heading}</h2>
      <dl className="product-card__fields">
        {PRODUCT_MODEL_FIELD_KEYS.map((key) => {
          const raw = product[key];
          const display = formatProductFieldForDisplay(key, product);
          const canOpenSellerProfile =
            key === "productSeller" &&
            typeof onSellerNameClick === "function" &&
            raw != null &&
            typeof raw === "object" &&
            raw._id != null &&
            display !== COMMON_UI.EM_DASH;

          return (
            <div key={key} className="product-card__row">
              <dt className="product-card__key">
                {PRODUCT_FIELD_LABEL_RU[key] ?? key}
              </dt>
              <dd className="product-card__value">
                {canOpenSellerProfile ? (
                  <button
                    type="button"
                    className="product-card__seller-name"
                    onClick={() => onSellerNameClick(String(raw._id))}
                  >
                    {display}
                  </button>
                ) : (
                  display
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
