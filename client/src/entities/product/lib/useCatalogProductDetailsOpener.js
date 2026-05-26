import { useCallback, useState } from "react";

import { resolveOrderLineItemProductId } from "../../order/lib/resolveOrderLineItemProductId.js";
import { fetchCatalogProductById } from "../api/fetchCatalogProductById.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

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
  const [catalogProduct, setCatalogProduct] = useState(
    /** @type {import('../model/types.js').ProductFromApi | null} */ (null),
  );
  const [catalogProductPhase, setCatalogProductPhase] = useState(
    /** @type {'idle' | 'loading' | 'ready' | 'error'} */ ("idle"),
  );
  const [catalogProductError, setCatalogProductError] = useState("");

  const openCatalogProductById = useCallback((productId) => {
    setCatalogProductError("");
    setCatalogProductPhase("loading");
    setCatalogProduct(null);

    void (async () => {
      try {
        const product = await fetchCatalogProductById(productId);
        setCatalogProduct(product);
        setCatalogProductPhase("ready");
      } catch (e) {
        setCatalogProductError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK,
        );
        setCatalogProductPhase("error");
      }
    })();
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
    setCatalogProduct(null);
    setCatalogProductPhase("idle");
    setCatalogProductError("");
  }, []);

  const patchCatalogProduct = useCallback((productId, patch) => {
    setCatalogProduct((prev) =>
      prev && String(prev._id) === productId ? { ...prev, ...patch } : prev,
    );
  }, []);

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
