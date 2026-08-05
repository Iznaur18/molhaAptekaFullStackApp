import { MY_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../entities/product/ui/productImageTokens.css";
import "../../../entities/product/ui/product-details-modal/productDetailsModalTokens.css";
import "./ProductDetailsPageSkeleton.css";

/**
 * Плейсхолдер полноэкранных деталей товара (паритет с layout page / page-split).
 */
export function ProductDetailsPageSkeleton() {
  return (
    <div
      className="product-details-page product-details-page-skeleton"
      role="status"
      aria-label={MY_ORDERS_PAGE_UI.PRODUCT_DETAILS_LOADING}
    >
      <div className="product-details-page-skeleton__body" aria-hidden="true">
        <div className="product-details-page-skeleton__top">
          <div className="product-details-page-skeleton__gallery">
            <span className="product-details-page-skeleton__hero" />
          </div>
          <div className="product-details-page-skeleton__rail">
            <span className="product-details-page-skeleton__line product-details-page-skeleton__line_title" />
            <span className="product-details-page-skeleton__line product-details-page-skeleton__line_price" />
            <span className="product-details-page-skeleton__cta product-details-page-skeleton__cta_inline" />
          </div>
        </div>

        <div className="product-details-page-skeleton__tabs">
          <span className="product-details-page-skeleton__tab" />
          <span className="product-details-page-skeleton__tab" />
          <span className="product-details-page-skeleton__tab product-details-page-skeleton__tab_short" />
        </div>

        <div className="product-details-page-skeleton__rest">
          <div className="product-details-page-skeleton__lead">
            <span className="product-details-page-skeleton__line product-details-page-skeleton__line_title" />
            <span className="product-details-page-skeleton__line product-details-page-skeleton__line_price" />
          </div>
          <span className="product-details-page-skeleton__line product-details-page-skeleton__line_wide" />
          <span className="product-details-page-skeleton__line" />
          <span className="product-details-page-skeleton__line product-details-page-skeleton__line_short" />
        </div>
      </div>

      <div className="product-details-page-skeleton__dock" aria-hidden="true">
        <span className="product-details-page-skeleton__cta" />
      </div>
    </div>
  );
}
