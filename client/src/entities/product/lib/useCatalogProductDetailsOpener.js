import { useCallback, useState } from "react";

import { resolveOrderLineItemProductId } from "../../order/lib/resolveOrderLineItemProductId.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { useCatalogProductByIdQuery } from "../model/useCatalogProductByIdQuery.js";

/**
 * @returns {{
 *   catalogProduct: import('../model/types.js').ProductFromApi | null;
 *   catalogProductPhase: 'idle' | 'loading' | 'ready' | 'error';
 *   catalogProductError: string;
 *   openCatalogProductFromOrderLine: (item: import('../../order/model/types.js').OrderLineItem) => void;
 *   openCatalogProductById: (productId: string) => void;
 *   closeCatalogProduct: () => void;
 *   patchCatalogProduct: (productId: string, patch: Record<string, unknown>) => void;
 * }}
 */
export function useCatalogProductDetailsOpener() {
  const [requestedProductId, setRequestedProductId] = useState(
    /** @type {string | null} */ (null),
  );
  const [catalogProductPatch, setCatalogProductPatch] = useState(
    /** @type {Record<string, unknown>} */ ({}),
  );

  const productQuery = useCatalogProductByIdQuery({
    productId: requestedProductId,
    enabled: Boolean(requestedProductId),
  });

  const catalogProduct =
    productQuery.data != null ? { ...productQuery.data, ...catalogProductPatch } : null;

  const catalogProductPhase = !requestedProductId
    ? "idle"
    : productQuery.isLoading
      ? "loading"
      : productQuery.isError
        ? "error"
        : productQuery.isSuccess
          ? "ready"
          : "loading";

  const catalogProductError =
    productQuery.error instanceof Error
      ? productQuery.error.message
      : productQuery.isError
        ? API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK
        : "";

  const openCatalogProductById = useCallback((productId) => {
    setCatalogProductPatch({});
    setRequestedProductId(String(productId));
  }, []);

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

  const closeCatalogProduct = useCallback(() => {
    setRequestedProductId(null);
    setCatalogProductPatch({});
  }, []);

  const patchCatalogProduct = useCallback((productId, patch) => {
    if (requestedProductId != null && String(requestedProductId) === productId) {
      setCatalogProductPatch((prev) => ({ ...prev, ...patch }));
    }
  }, [requestedProductId]);

  return {
    catalogProduct,
    catalogProductPhase,
    catalogProductError,
    openCatalogProductFromOrderLine,
    openCatalogProductById,
    closeCatalogProduct,
    patchCatalogProduct,
  };
}
