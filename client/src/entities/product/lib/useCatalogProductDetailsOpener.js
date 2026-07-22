import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { resolveOrderLineItemProductId } from "../../order/lib/resolveOrderLineItemProductId.js";
import { navigateToProductDetails } from "./navigateToProductDetails.js";

/**
 * @returns {{
 *   openCatalogProductFromOrderLine: (item: import('../../order/model/types.js').OrderLineItem) => void;
 *   openCatalogProductById: (productId: string) => void;
 * }}
 */
export function useCatalogProductDetailsOpener() {
  const navigate = useNavigate();

  const openCatalogProductById = useCallback(
    (productId) => {
      navigateToProductDetails(navigate, productId);
    },
    [navigate],
  );

  const openCatalogProductFromOrderLine = useCallback(
    (lineItem) => {
      const productId = resolveOrderLineItemProductId(lineItem);
      if (!productId) {
        return;
      }
      openCatalogProductById(productId);
    },
    [openCatalogProductById],
  );

  return {
    openCatalogProductFromOrderLine,
    openCatalogProductById,
  };
}
