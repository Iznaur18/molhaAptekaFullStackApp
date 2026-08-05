import { useMemo } from "react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";
import { getProductFieldLabel } from "../../lib/productFieldRegistry.js";
import { PRODUCT_DETAILS_CONTENT_PANEL } from "../../lib/productDetailsContentPanelConstants.js";
import { ProductCharacteristicsDetails } from "../ProductCharacteristicsDetails.jsx";
import { ProductDescriptionContent } from "../ProductDescriptionContent.jsx";
import { ProductPickupDetailsPanel } from "./ProductPickupDetailsPanel.jsx";
import { useProductDetailsContentPanel } from "./useProductDetailsContentPanel.js";

import "./ProductDetailsContentSwitcher.css";
import "./ProductPickupDetailsPanel.css";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   contentPanels: ReturnType<import('../../lib/resolveProductDetailsContentPanels.js').resolveProductDetailsContentPanels>;
 * }} props
 */
export function ProductDetailsContentSwitcher({ product, contentPanels }) {
  const { hasDescription, hasCharacteristics, showSwitcher, defaultPanel } = contentPanels;
  const [activePanel, setActivePanel] = useProductDetailsContentPanel(
    defaultPanel,
    product._id,
  );

  const tabs = useMemo(() => {
    const items = [];
    if (hasDescription) {
      items.push({
        id: PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION,
        label: getProductFieldLabel("productDescription"),
      });
    }
    items.push({
      id: PRODUCT_DETAILS_CONTENT_PANEL.DELIVERY,
      label: PRODUCT_DETAILS_MODAL_UI.DELIVERY_TITLE,
    });
    if (hasCharacteristics) {
      items.push({
        id: PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS,
        label: PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE,
      });
    }
    items.push({
      id: PRODUCT_DETAILS_CONTENT_PANEL.RETURNS,
      label: PRODUCT_DETAILS_MODAL_UI.RETURNS_TITLE,
    });
    return items;
  }, [hasCharacteristics, hasDescription]);

  const descriptionText = String(product.productDescription ?? "").trim();
  const returnTerms = Array.isArray(product.productReturnTerms)
    ? product.productReturnTerms
    : [];
  const hasReturnTerms = product.productReturnEnabled === true && returnTerms.length > 0;
  const showDescription =
    activePanel === PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION && hasDescription;
  const showCharacteristics =
    activePanel === PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS && hasCharacteristics;
  const showReturns = activePanel === PRODUCT_DETAILS_CONTENT_PANEL.RETURNS;
  const showDelivery = activePanel === PRODUCT_DETAILS_CONTENT_PANEL.DELIVERY;

  const panelAriaLabel = showDelivery
    ? PRODUCT_DETAILS_MODAL_UI.DELIVERY_SECTION_ARIA
    : showReturns
      ? PRODUCT_DETAILS_MODAL_UI.RETURNS_SECTION_ARIA
      : showCharacteristics
        ? PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA
        : PRODUCT_DETAILS_MODAL_UI.DESCRIPTION_SECTION_ARIA;

  return (
    <section
      className="product-details-content-switcher"
      aria-label={PRODUCT_DETAILS_MODAL_UI.CONTENT_SWITCHER_ARIA}
    >
      {showSwitcher ? (
        <div className="product-details-content-switcher__header">
          <ModalSectionTabs
            tabs={tabs}
            activeTabId={activePanel}
            onTabChange={setActivePanel}
            ariaLabel={PRODUCT_DETAILS_MODAL_UI.CONTENT_SWITCHER_ARIA}
          />
        </div>
      ) : null}

      <div
        className="product-details-content-switcher__panel"
        role={showSwitcher ? "tabpanel" : undefined}
        aria-label={panelAriaLabel}
      >
        {showDescription ? (
          <ProductDescriptionContent
            text={descriptionText}
            className="product-details-content-switcher__description"
          />
        ) : null}
        {showCharacteristics ? (
          <ProductCharacteristicsDetails
            items={product.productCharacteristics}
            showTitle={false}
          />
        ) : null}
        {showReturns ? (
          hasReturnTerms ? (
            <ProductCharacteristicsDetails
              items={returnTerms}
              showTitle={false}
            />
          ) : (
            <p className="product-details-content-switcher__description">
              {product.productReturnEnabled === true
                ? PRODUCT_DETAILS_MODAL_UI.RETURNS_PLACEHOLDER
                : PRODUCT_DETAILS_MODAL_UI.RETURNS_NONE}
            </p>
          )
        ) : null}
        {showDelivery ? <ProductPickupDetailsPanel product={product} /> : null}
      </div>
    </section>
  );
}
