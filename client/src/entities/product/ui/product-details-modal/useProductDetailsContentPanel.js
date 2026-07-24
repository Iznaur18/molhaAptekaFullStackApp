import { useEffect, useState } from "react";

import { PRODUCT_DETAILS_CONTENT_PANEL } from "../../lib/productDetailsContentPanelConstants.js";

/**
 * @param {string | null | undefined} defaultPanel
 * @param {string | null | undefined} productId
 */
export function useProductDetailsContentPanel(defaultPanel, productId) {
  const [activePanel, setActivePanel] = useState(
    defaultPanel ?? PRODUCT_DETAILS_CONTENT_PANEL.RETURNS,
  );

  useEffect(() => {
    setActivePanel(defaultPanel ?? PRODUCT_DETAILS_CONTENT_PANEL.RETURNS);
  }, [defaultPanel, productId]);

  return [activePanel, setActivePanel];
}
