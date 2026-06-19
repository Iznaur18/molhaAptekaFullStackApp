import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { patchProductInAllCatalogCaches } from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { resolveCatalogDetailsShowAddToCart } from "../lib/resolveCatalogDetailsShowAddToCart.js";
import { useEnsureCatalogProduct } from "../../../entities/product/model/useEnsureCatalogProduct.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { PRODUCT_MODERATION_APPROVED } from "../../../entities/product/model/productModerationConstants.js";
import { useMyProductReportStatusQuery } from "../../../entities/product-report/model/useMyProductReportStatusQuery.js";
import { productReportQueryKeys } from "../../../entities/product-report/model/productReportQueryKeys.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 * @param {() => void} [params.onBeforeOpenDetails] — закрыть edit/create overlay
 */
export const useHomeCatalogProductDetails = ({
  isAuthorized,
  currentUserId,
  isAdmin,
  isMineMode,
  products,
  catalogProductDetails,
  setCatalogProductDetails,
  setProductDetailsAdminError,
  onBeforeOpenDetails,
}) => {
  const queryClient = useQueryClient();
  const ensureCatalogProduct = useEnsureCatalogProduct();
  const [catalogProductDetailsTab, setCatalogProductDetailsTab] = useState(
    /** @type {'details' | 'auction' | 'reviews' | 'installment'} */ ("details"),
  );

  const reportStatusQuery = useMyProductReportStatusQuery({
    productId: catalogProductDetails?._id,
    enabled: Boolean(catalogProductDetails?._id && isAuthorized),
  });
  const catalogProductHasPendingReport =
    reportStatusQuery.data?.hasPendingReport ?? false;

  const canReportCatalogProduct = useMemo(() => {
    if (!isAuthorized || !catalogProductDetails || !currentUserId) {
      return false;
    }
    if (catalogProductDetails.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
      return false;
    }
    return !isCurrentUserProductSeller(catalogProductDetails, currentUserId);
  }, [isAuthorized, catalogProductDetails, currentUserId]);

  const showCatalogProductManageFooter = useMemo(() => {
    const product = catalogProductDetails;
    if (!product || !isAuthorized || !currentUserId) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    if (isMineMode) {
      return false;
    }
    return isCurrentUserProductSeller(product, currentUserId);
  }, [catalogProductDetails, isAuthorized, currentUserId, isAdmin, isMineMode]);

  const catalogDetailsShowAddToCart = useMemo(
    () =>
      resolveCatalogDetailsShowAddToCart({
        product: catalogProductDetails,
        isMineMode,
        currentUserId,
      }),
    [catalogProductDetails, currentUserId, isMineMode],
  );

  /** @param {string} productId @param {ProductFromApi | null | undefined} [seedProduct] */
  const openCatalogProductDetails = useCallback(
    (productId, seedProduct = null) => {
      onBeforeOpenDetails?.();
      setCatalogProductDetailsTab("details");

      const inList = products.find((row) => String(row._id) === String(productId));
      if (inList) {
        setCatalogProductDetails(inList);
        return;
      }

      if (seedProduct) {
        setCatalogProductDetails(seedProduct);
      }

      void ensureCatalogProduct(String(productId))
        .then((product) => {
          setCatalogProductDetails(product);
        })
        .catch(() => {
          setCatalogProductDetails(null);
        });
    },
    [ensureCatalogProduct, onBeforeOpenDetails, products, setCatalogProductDetails],
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
      setCatalogProductDetails((prev) =>
        prev && String(prev._id) === productId ? { ...prev, ...stats } : prev,
      );
      patchProductInAllCatalogCaches(queryClient, productId, (product) => ({
        ...product,
        ...stats,
      }));
    },
    [queryClient, setCatalogProductDetails],
  );

  const closeCatalogProductDetails = useCallback(() => {
    setCatalogProductDetails(null);
    setCatalogProductDetailsTab("details");
    setProductDetailsAdminError("");
  }, [
    setCatalogProductDetails,
    setCatalogProductDetailsTab,
    setProductDetailsAdminError,
  ]);

  const setCatalogProductHasPendingReport = useCallback(
    (value) => {
      if (!catalogProductDetails?._id) {
        return;
      }
      queryClient.setQueryData(productReportQueryKeys.myStatus(String(catalogProductDetails._id)), {
        hasPendingReport: value,
      });
    },
    [catalogProductDetails?._id, queryClient],
  );

  return {
    closeCatalogProductDetails,
    catalogProductDetailsTab,
    setCatalogProductDetailsTab,
    catalogProductHasPendingReport,
    setCatalogProductHasPendingReport,
    canReportCatalogProduct,
    showCatalogProductManageFooter,
    catalogDetailsShowAddToCart,
    handleCatalogProductClick,
    handleOpenCatalogProductDetails,
    handleUserProfileProductClick,
    handleProductStatsUpdate,
  };
};
