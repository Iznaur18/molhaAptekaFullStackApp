import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";

import { CuratedListViewAllSheet } from "../../curated-product-list/ui/CuratedListViewAllSheet.jsx";
import { useCuratedCarouselImageDragScroll } from "../../curated-product-list/lib/useCuratedCarouselImageDragScroll.js";
import { WishlistToggleButton } from "../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { resolveProductCatalogPriceRub } from "../lib/resolveProductCatalogPriceRub.js";
import { resolveProductImageUrl } from "../lib/resolveProductImageUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../model/productConstants.js";

import "./BoostProductsHomeSection.css";

/**
 * Блок «Буст продвижение» на главной: белая карточка с шапкой
 * (молния + заголовок + «Все товары») и рядом мини-карточек товаров.
 * Отдельный от CuratedProductListCarousel компонент, чтобы не ломать
 * админские подборки, которые делят ту же карусель.
 *
 * @param {{
 *   products: import('../model/types.js').ProductFromApi[];
 *   onOpenProduct: (product: import('../model/types.js').ProductFromApi) => void;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   currentUserId?: string | null;
 * }} props
 */
export function BoostProductsHomeSection({
  products,
  onOpenProduct,
  isAuthorized,
  onRequestLogin,
  currentUserId = null,
}) {
  const { ref: scrollRef, dragScrollProps } = useCuratedCarouselImageDragScroll();
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  if (products.length === 0) {
    return null;
  }

  const title = HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS;

  return (
    <>
      <section className="boost-home-section" aria-label={title}>
        <div className="boost-home-section__header">
          <span className="boost-home-section__icon" aria-hidden>
            <Zap size={18} />
          </span>
          <div className="boost-home-section__headings">
            <h2 className="boost-home-section__title">{title}</h2>
            <p className="boost-home-section__subtitle">
              {HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS_SUBTITLE}
            </p>
          </div>
          <button
            type="button"
            className="boost-home-section__view-all"
            onClick={() => setIsViewAllOpen(true)}
          >
            {HOME_PAGE_UI.CATALOG_HOME_SECTION_BOOST_PRODUCTS_VIEW_ALL}
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="boost-home-section__scroll"
          {...dragScrollProps}
        >
          <ul className="boost-home-section__track" role="list">
            {products.map((product) => (
              <li key={product._id} className="boost-home-section__item">
                <BoostProductMiniCard
                  product={product}
                  onOpen={onOpenProduct}
                  isAuthorized={isAuthorized}
                  onRequestLogin={onRequestLogin}
                  currentUserId={currentUserId}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CuratedListViewAllSheet
        isOpen={isViewAllOpen}
        title={title}
        products={products}
        onOpenProduct={onOpenProduct}
        onClose={() => setIsViewAllOpen(false)}
      />
    </>
  );
}

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   onOpen: (product: import('../model/types.js').ProductFromApi) => void;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   currentUserId: string | null;
 * }} props
 */
function BoostProductMiniCard({
  product,
  onOpen,
  isAuthorized,
  onRequestLogin,
  currentUserId,
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveProductImageUrl(product);
  const imageUrl = failed || !resolved ? PRODUCT_IMAGE_PLACEHOLDER_URL : resolved;
  const priceLabel = formatPriceRub(resolveProductCatalogPriceRub(product));
  const openLabel = `Открыть товар ${product.productName}`;

  return (
    <article className="boost-mini-card">
      <div className="boost-mini-card__media">
        <button
          type="button"
          className="boost-mini-card__image-wrap"
          onClick={() => onOpen(product)}
          aria-label={openLabel}
        >
          <img
            className="boost-mini-card__image"
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
          />
        </button>
        <button
          type="button"
          className="boost-mini-card__price-wrap"
          onClick={() => onOpen(product)}
          aria-label={openLabel}
        >
          <span className="boost-mini-card__price">{priceLabel}</span>
        </button>
        <WishlistToggleButton
          className="boost-mini-card__wishlist"
          productId={String(product._id)}
          product={product}
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          currentUserId={currentUserId}
          variant="card"
        />
      </div>
    </article>
  );
}
