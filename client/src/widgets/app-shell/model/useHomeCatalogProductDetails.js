import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { patchProductInAllCatalogCaches } from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * Открытие деталей товара — navigate на `/product/:id` (не модалка).
 *
 * @param {object} params
 * @param {() => void} [params.onBeforeOpenDetails]
 */
export const useHomeCatalogProductDetails = ({ onBeforeOpenDetails }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /** @param {string} productId @param {ProductFromApi | null | undefined} [_seedProduct] */
  const openCatalogProductDetails = useCallback(
    (productId, _seedProduct = null) => {
      onBeforeOpenDetails?.();
      navigateToProductDetails(navigate, productId);
    },
    [navigate, onBeforeOpenDetails],
  );

  /** @param {string} productId */
  const handleCatalogProductClick = useCallback(
    (productId) => {
      openCatalogProductDetails(productId);
    },
    [openCatalogProductDetails],
  );

  /** @param {ProductFromApi} product */
  const handleOpenCatalogProductDetails = useCallback(
    (product) => {
      if (product?._id == null) {
        return;
      }
      openCatalogProductDetails(String(product._id), product);
    },
    [openCatalogProductDetails],
  );

  const handleUserProfileProductClick = handleOpenCatalogProductDetails;

  const handleProductStatsUpdate = useCallback(
    (productId, stats) => {
      patchProductInAllCatalogCaches(queryClient, productId, (product) => {
        const next = { ...product, ...stats };
        const keys = Object.keys(stats);
        const unchanged = keys.every((key) => Object.is(product[key], next[key]));
        return unchanged ? product : next;
      });
    },
    [queryClient],
  );

  /** No-op: детали — отдельный роут; header всё ещё вызывает при смене view. */
  const closeCatalogProductDetails = useCallback(() => {}, []);

  return {
    closeCatalogProductDetails,
    handleCatalogProductClick,
    handleOpenCatalogProductDetails,
    handleUserProfileProductClick,
    handleProductStatsUpdate,
  };
};
