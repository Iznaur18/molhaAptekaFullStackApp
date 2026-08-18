import { ProductDescriptionContent } from "./ProductDescriptionContent.jsx";
import { ProductCharacteristicsDetails } from "./ProductCharacteristicsDetails.jsx";
import { ProductDetailsSellerPreview } from "./ProductDetailsSellerPreview.jsx";
import { ProductMediaGalleryReadonly } from "./ProductMediaGalleryReadonly.jsx";
import { ProductPriceDisplay } from "./ProductPriceDisplay.jsx";
import { buildProductModerationCreateDetails } from "../lib/buildProductModerationCreateDetails.js";
import { resolveProductListingOriginPresentation } from "../lib/productListingOrigin.js";
import {
  COMMON_UI,
  CREATE_PRODUCT_MODAL_UI,
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_PICKUP_UI,
} from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { ProductPickupDetailsPanel } from "./product-details-modal/ProductPickupDetailsPanel.jsx";

import "./product-details-modal/ProductPickupDetailsPanel.css";
import "./ProductModerationCreateDetailsModal.css";

/**
 * @param {{
 *   key: string;
 *   label: string;
 *   value: string;
 * }[]} rows
 */
function FactList({ rows }) {
  if (rows.length === 0) return null;
  return (
    <dl className="product-moderation-create-details__facts">
      {rows.map((row) => (
        <div key={row.key} className="product-moderation-create-details__fact">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi | null;
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSellerNameClick?: (userId: string) => void;
 * }} props
 */
export function ProductModerationCreateDetailsModal({
  product,
  isOpen,
  onClose,
  onSellerNameClick,
}) {
  const details = isOpen ? buildProductModerationCreateDetails(product) : null;
  const origin =
    product != null
      ? resolveProductListingOriginPresentation(product.productListingOrigin)
      : null;

  return (
    <ProductModalShell
      isOpen={isOpen && details != null}
      onClose={onClose}
      title={PRODUCT_MODERATION_PAGE_UI.DETAILS_TITLE}
      titleId="product-moderation-create-details-title"
      ariaLabel={PRODUCT_MODERATION_PAGE_UI.DETAILS_ARIA}
      size="lg"
      bodyClassName="product-moderation-create-details"
    >
      {details == null || product == null ? null : (
        <>
          <div
            className="product-moderation-create-details__gallery"
            aria-label={PRODUCT_MODERATION_PAGE_UI.SECTION_MEDIA}
          >
            <ProductMediaGalleryReadonly
              imageUrls={details.imageUrls}
              previewVideoUrl={details.previewVideoUrl}
              isActive={isOpen}
              resetToken={details.productId}
            />
          </div>

          <header className="product-moderation-create-details__heading-block">
            <h3 className="product-moderation-create-details__name">{details.heading}</h3>
            {origin ? (
              <p className="product-moderation-create-details__origin">
                <AppIcon icon={origin.Icon} size="sm" strokeWidth={2.25} />
                <span>{origin.label}</span>
              </p>
            ) : null}
            <ProductPriceDisplay
              product={product}
              showLabel={false}
              variant="inline"
              showDiscountBadge
              showLoyaltyBadge
              isAuthorized
            />
          </header>

          <section aria-label={PRODUCT_MODERATION_PAGE_UI.SECTION_FACTS}>
            <h4 className="product-moderation-create-details__section-title">
              {PRODUCT_MODERATION_PAGE_UI.SECTION_FACTS}
            </h4>
            <FactList rows={details.factRows} />
          </section>

          <section aria-label={CREATE_PRODUCT_MODAL_UI.LABEL_DESCRIPTION}>
            <h4 className="product-moderation-create-details__section-title">
              {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_BASIC}
            </h4>
            {details.description ? (
              <ProductDescriptionContent text={details.description} />
            ) : (
              <p className="product-moderation-create-details__empty">
                {PRODUCT_MODERATION_PAGE_UI.EMPTY_DESCRIPTION}
              </p>
            )}
          </section>

          <section aria-label={PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA}>
            <h4 className="product-moderation-create-details__section-title">
              {PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}
            </h4>
            {details.characteristics.length > 0 ? (
              <ProductCharacteristicsDetails
                items={details.characteristics}
                showTitle={false}
              />
            ) : (
              <p className="product-moderation-create-details__empty">
                {PRODUCT_MODERATION_PAGE_UI.EMPTY_CHARACTERISTICS}
              </p>
            )}
          </section>

          <section aria-label={PRODUCT_PICKUP_UI.DETAILS_TITLE}>
            <h4 className="product-moderation-create-details__section-title">
              {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_PICKUP}
            </h4>
            <ProductPickupDetailsPanel product={product} />
            <FactList
              rows={[
                {
                  key: "coords",
                  label: PRODUCT_MODERATION_PAGE_UI.COORDS_LABEL,
                  value:
                    details.pickup.coordsText ?? PRODUCT_MODERATION_PAGE_UI.COORDS_EMPTY,
                },
              ]}
            />
            {details.pickup.mapsUrl && !details.pickup.enabled ? (
              <a
                className="product-moderation-create-details__map-link"
                href={details.pickup.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PRODUCT_MODERATION_PAGE_UI.OPEN_MAP}
              </a>
            ) : null}
          </section>

          <section aria-label={PRODUCT_DETAILS_MODAL_UI.RETURNS_SECTION_ARIA}>
            <h4 className="product-moderation-create-details__section-title">
              {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_LABEL_RETURNS}
            </h4>
            {details.returnEnabled && details.returnTerms.length > 0 ? (
              <ProductCharacteristicsDetails
                items={details.returnTerms}
                showTitle={false}
              />
            ) : (
              <p className="product-moderation-create-details__empty">
                {details.returnEnabled
                  ? PRODUCT_DETAILS_MODAL_UI.RETURNS_PLACEHOLDER
                  : PRODUCT_DETAILS_MODAL_UI.RETURNS_NONE}
              </p>
            )}
          </section>

          <section aria-label={PRODUCT_MODERATION_PAGE_UI.SELLER_LABEL}>
            <h4 className="product-moderation-create-details__section-title">
              {PRODUCT_MODERATION_PAGE_UI.SELLER_LABEL}
            </h4>
            <ProductDetailsSellerPreview
              seller={product.productSeller}
              onOpenProfile={
                typeof onSellerNameClick === "function"
                  ? (userId) => {
                      onClose();
                      onSellerNameClick(userId);
                    }
                  : undefined
              }
            />
            <FactList rows={details.sellerFactRows} />
            {details.seller == null ? (
              <p className="product-moderation-create-details__empty">{COMMON_UI.EM_DASH}</p>
            ) : null}
          </section>
        </>
      )}
    </ProductModalShell>
  );
}
