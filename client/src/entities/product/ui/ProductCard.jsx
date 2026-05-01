import { useState } from 'react';

import { UserDetailsModal } from '../../user/ui/UserDetailsModal.jsx';
import { PRODUCT_CATEGORY_LABEL_RU } from '../model/productConstants.js';

import './ProductCard.css';

const RUBLE_FORMAT = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatPriceRub(price) {
  return RUBLE_FORMAT.format(price);
}

function formatRatingLine(rating) {
  if (!rating || rating.countVotes === 0) {
    return 'Нет оценок';
  }
  const average = rating.totalRating / rating.countVotes;
  return `${average.toFixed(1)} · ${rating.countVotes} оц.`;
}

function categoryLabel(category) {
  return PRODUCT_CATEGORY_LABEL_RU[category] ?? category;
}

function formatListedAt(iso) {
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * @param {object} props
 * @param {import('../model/types.js').ProductListItem} props.product
 */
export function ProductCard({ product }) {
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const seller = product.productSeller;
  const availabilityLabel = product.productIsAvailable
    ? 'В наличии'
    : 'Нет в наличии';
  const availabilityClass = product.productIsAvailable
    ? 'product-card__availability_available'
    : 'product-card__availability_unavailable';

  return (
    <article className="product-card">
      <header className="product-card__header">
        <h3 className="product-card__title">{product.productName}</h3>
        <span className={`product-card__availability ${availabilityClass}`}>
          {availabilityLabel}
        </span>
      </header>
      <p className="product-card__category">{categoryLabel(product.productCategory)}</p>
      {product.productDescription ? (
        <p className="product-card__description">{product.productDescription}</p>
      ) : null}
      <p className="product-card__price">{formatPriceRub(product.productPrice)}</p>
      <footer className="product-card__footer">
        <p className="product-card__seller">
          <span className="product-card__seller-label">Продавец:</span>{' '}
          <button
            type="button"
            className="product-card__seller-link"
            onClick={() => setSellerModalOpen(true)}
          >
            {seller.userName}
          </button>
        </p>
        <p className="product-card__rating">{formatRatingLine(seller.userRatingByVotes)}</p>
        <p className="product-card__meta">Размещено: {formatListedAt(product.createdAt)}</p>
      </footer>
      <UserDetailsModal
        isOpen={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
        user={seller}
      />
    </article>
  );
}
