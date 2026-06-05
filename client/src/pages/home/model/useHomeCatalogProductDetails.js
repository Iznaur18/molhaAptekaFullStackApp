import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchCatalogProductById } from "../../../entities/product/api/fetchCatalogProductById.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { PRODUCT_MODERATION_APPROVED } from "../../../entities/product/model/productModerationConstants.js";
import { fetchMyProductReportStatus } from "../../../entities/product-report/api/fetchMyProductReportStatus.js";

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
  setProducts,
  catalogProductDetails,
  setCatalogProductDetails,
  onBeforeOpenDetails,
}) => {
  const [catalogProductDetailsTab, setCatalogProductDetailsTab] = useState(
    /** @type {'details' | 'auction' | 'reviews' | 'installment'} */ ("details"),
  );
  const [catalogProductHasPendingReport, setCatalogProductHasPendingReport] =
    useState(false);

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

  const catalogDetailsShowAddToCart = useMemo(() => {
    const product = catalogProductDetails;
    if (!product) {
      return false;
    }
    if (isMineMode) {
      return false;
    }
    if (isCurrentUserProductSeller(product, currentUserId)) {
      return false;
    }
    return true;
  }, [catalogProductDetails, isMineMode, currentUserId]);

  /** @param {string} productId */
  const handleCatalogProductClick = useCallback(
    (productId) => {
      onBeforeOpenDetails?.();
      setCatalogProductDetailsTab("details");
      const inList = products.find((row) => String(row._id) === String(productId));
      if (inList) {
        setCatalogProductDetails(inList);
        return;
      }

      void (async () => {
        try {
          const product = await fetchCatalogProductById(productId);
          setCatalogProductDetails(product);
        } catch {
          // модалка не открывается
        }
      })();
    },
    [onBeforeOpenDetails, products, setCatalogProductDetails],
  );

  const handleProductStatsUpdate = useCallback(
    (productId, stats) => {
      setCatalogProductDetails((prev) =>
        prev && String(prev._id) === productId ? { ...prev, ...stats } : prev,
      );
      setProducts((prev) =>
        prev.map((p) => (String(p._id) === productId ? { ...p, ...stats } : p)),
      );
    },
    [setCatalogProductDetails, setProducts],
  );

  useEffect(() => {
    if (!catalogProductDetails?._id || !isAuthorized) {
      setCatalogProductHasPendingReport(false);
      return undefined;
    }

    let isCancelled = false;
    void (async () => {
      try {
        const { hasPendingReport } = await fetchMyProductReportStatus(
          String(catalogProductDetails._id),
        );
        if (!isCancelled) {
          setCatalogProductHasPendingReport(hasPendingReport);
        }
      } catch {
        if (!isCancelled) {
          setCatalogProductHasPendingReport(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [catalogProductDetails?._id, isAuthorized]);

  return {
    catalogProductDetailsTab,
    setCatalogProductDetailsTab,
    catalogProductHasPendingReport,
    setCatalogProductHasPendingReport,
    canReportCatalogProduct,
    showCatalogProductManageFooter,
    catalogDetailsShowAddToCart,
    handleCatalogProductClick,
    handleProductStatsUpdate,
  };
};
