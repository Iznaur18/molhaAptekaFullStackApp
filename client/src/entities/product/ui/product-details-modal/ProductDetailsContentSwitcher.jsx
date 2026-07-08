import { useMemo } from "react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";
import { getProductFieldLabel } from "../../lib/productFieldRegistry.js";
import { PRODUCT_DETAILS_CONTENT_PANEL } from "../../lib/productDetailsContentPanelConstants.js";
import { ProductCharacteristicsDetails } from "../ProductCharacteristicsDetails.jsx";
import { useProductDetailsContentPanel } from "./useProductDetailsContentPanel.js";

import "./ProductDetailsContentSwitcher.css";

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
    if (hasCharacteristics) {
      items.push({
        id: PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS,
        label: PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE,
      });
    }
    return items;
  }, [hasCharacteristics, hasDescription]);

  const descriptionText = String(product.productDescription ?? "").trim();

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
        aria-label={
          activePanel === PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS
            ? PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA
            : PRODUCT_DETAILS_MODAL_UI.DESCRIPTION_SECTION_ARIA
        }
      >
        {activePanel === PRODUCT_DETAILS_CONTENT_PANEL.DESCRIPTION && hasDescription ? (
          <p className="product-details-content-switcher__description">{descriptionText}</p>
        ) : null}
        {activePanel === PRODUCT_DETAILS_CONTENT_PANEL.CHARACTERISTICS &&
        hasCharacteristics ? (
          <ProductCharacteristicsDetails
            items={product.productCharacteristics}
            showTitle={false}
          />
        ) : null}
      </div>
    </section>
  );
}
