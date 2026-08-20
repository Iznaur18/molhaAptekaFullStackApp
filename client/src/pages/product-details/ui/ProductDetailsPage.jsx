import { useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { canSellerDeleteProduct, canSellerEditProduct } from "../../../entities/product/lib/getProductModerationUi.js";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { patchProductInAllCatalogCaches } from "../../../entities/product/lib/catalogProductsQueryCache.js";
import { PRODUCT_MODERATION_APPROVED } from "../../../entities/product/model/productModerationConstants.js";
import { useCatalogProductByIdQuery } from "../../../entities/product/model/useCatalogProductByIdQuery.js";
import { ProductDetailsAdminFooter } from "../../../entities/product/ui/ProductDetailsAdminFooter.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { productReportQueryKeys } from "../../../entities/product-report/model/productReportQueryKeys.js";
import { useMyProductReportStatusQuery } from "../../../entities/product-report/model/useMyProductReportStatusQuery.js";
import { ReportProductModal } from "../../../entities/product-report/ui/ReportProductModal.jsx";
import { API_CLIENT_UI, PRODUCT_REPORT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { resolveCatalogDetailsShowAddToCart } from "../../../widgets/app-shell/lib/resolveCatalogDetailsShowAddToCart.js";
import { useAppShellStateContext } from "../../../widgets/app-shell/model/AppShellStateContext.jsx";

import "./ProductDetailsPage.css";
import { ProductDetailsPageSkeleton } from "./ProductDetailsPageSkeleton.jsx";

function navigateBackOrHome(navigate) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate("/", { replace: true });
}

/**
 * Полноэкранные детали товара — паритет с mobile `/product/[id]`.
 */
export function ProductDetailsPage() {
  const { productId: productIdParam } = useParams();
  const productId = productIdParam != null ? String(productIdParam) : "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shell = useAppShellStateContext();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [productPatch, setProductPatch] = useState(/** @type {Record<string, unknown>} */ ({}));

  const productQuery = useCatalogProductByIdQuery({
    productId,
    enabled: Boolean(productId),
  });

  useScrollLock(Boolean(productId));

  const product =
    productQuery.data != null ? { ...productQuery.data, ...productPatch } : null;

  const reportStatusQuery = useMyProductReportStatusQuery({
    productId: product?._id,
    enabled: Boolean(product?._id && shell.isAuthorized),
  });
  const hasPendingReport = reportStatusQuery.data?.hasPendingReport ?? false;

  const canReport = useMemo(() => {
    if (!shell.isAuthorized || !product || !shell.currentUserId) {
      return false;
    }
    if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
      return false;
    }
    return !isCurrentUserProductSeller(product, shell.currentUserId);
  }, [product, shell.currentUserId, shell.isAuthorized]);

  const showManageFooter = useMemo(() => {
    if (!product || !shell.isAuthorized || !shell.currentUserId) {
      return false;
    }
    if (shell.isAdmin) {
      return true;
    }
    if (shell.isMineMode) {
      return false;
    }
    return isCurrentUserProductSeller(product, shell.currentUserId);
  }, [product, shell.currentUserId, shell.isAdmin, shell.isAuthorized, shell.isMineMode]);

  const showAddToCart = useMemo(
    () =>
      resolveCatalogDetailsShowAddToCart({
        product,
        isMineMode: shell.isMineMode,
        currentUserId: shell.currentUserId,
      }),
    [product, shell.currentUserId, shell.isMineMode],
  );

  const handleClose = useCallback(() => {
    navigateBackOrHome(navigate);
  }, [navigate]);

  const handleSellerNameClick = useCallback(
    (userId) => {
      shell.handleSellerNameClick?.(userId);
    },
    [shell],
  );

  const handleProductStatsUpdate = useCallback(
    (id, stats) => {
      setProductPatch((prev) => {
        const next = { ...prev, ...stats };
        const keys = Object.keys(stats);
        const unchanged = keys.every((key) => Object.is(prev[key], next[key]));
        return unchanged ? prev : next;
      });
      patchProductInAllCatalogCaches(queryClient, id, (row) => {
        const next = { ...row, ...stats };
        const keys = Object.keys(stats);
        const unchanged = keys.every((key) => Object.is(row[key], next[key]));
        return unchanged ? row : next;
      });
      shell.handleProductStatsUpdate?.(id, stats);
    },
    [queryClient, shell.handleProductStatsUpdate],
  );

  const handleEdit = useCallback(() => {
    if (!product) {
      return;
    }
    shell.setIsCreateProductModalOpen?.(false);
    shell.setProductToEdit?.(product);
  }, [product, shell]);

  const canPromote = useMemo(() => {
    if (!product || !shell.isAuthorized || !shell.currentUserId) {
      return false;
    }
    if (!isCurrentUserProductSeller(product, shell.currentUserId)) {
      return false;
    }
    // Owner can open manage (incl. delete) even while pending / unavailable.
    return true;
  }, [product, shell.currentUserId, shell.isAuthorized]);

  const handlePromote = useCallback(() => {
    if (!product) {
      return;
    }
    shell.handleOpenPromotionModal?.(product);
  }, [product, shell]);

  const handleDelete = useCallback(async () => {
    if (!product?._id || typeof shell.handleDeleteMyProduct !== "function") {
      return;
    }
    const ok = await shell.handleDeleteMyProduct(String(product._id));
    if (ok) {
      navigateBackOrHome(navigate);
    }
  }, [navigate, product, shell]);

  const isOwnProduct = Boolean(
    product && shell.currentUserId && isCurrentUserProductSeller(product, shell.currentUserId),
  );
  const canDeleteProduct =
    Boolean(shell.isAdmin) || (isOwnProduct && canSellerDeleteProduct(product));

  if (!productId) {
    return (
      <p className="product-details-page__state product-details-page__state_error" role="alert">
        {API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK}
      </p>
    );
  }

  if (productQuery.isPending && !product) {
    return <ProductDetailsPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="product-details-page product-details-page--state">
        <div className="product-details-page__state-wrap">
          <p className="product-details-page__state product-details-page__state_error" role="alert">
            {productQuery.error instanceof Error
              ? productQuery.error.message
              : API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK}
          </p>
          <button type="button" className="product-details-page__back" onClick={handleClose}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductDetailsModal
        presentation="page"
        isOpen
        product={product}
        onClose={handleClose}
        onSellerNameClick={handleSellerNameClick}
        isAuthorized={shell.isAuthorized}
        onProductStatsUpdate={handleProductStatsUpdate}
        showAddToCart={showAddToCart}
        onRequestLogin={() => shell.setIsLoginModalOpen?.(true)}
        currentUserId={shell.currentUserId}
        isPremiumUser={shell.isPremiumUser}
        onProfileActionBadgesChanged={shell.refreshUserProfileActionBadgeCounts}
        showStaffDetails={Boolean(shell.canModerateProducts)}
        secondaryFooter={
          canReport ? (
            <button
              type="button"
              className="product-details-modal__footer-btn product-details-modal__footer-btn--report"
              disabled={hasPendingReport}
              aria-label={
                hasPendingReport
                  ? PRODUCT_REPORT_MODAL_UI.ALREADY_REPORTED
                  : PRODUCT_REPORT_MODAL_UI.REPORT_BUTTON
              }
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (hasPendingReport) {
                  return;
                }
                if (!shell.isAuthorized) {
                  shell.setIsLoginModalOpen?.(true);
                  return;
                }
                setIsReportModalOpen(true);
              }}
            >
              <AppIcon icon={Flag} size="lg" strokeWidth={2.1} />
            </button>
          ) : null
        }
        adminFooter={
          showManageFooter ? (
            <ProductDetailsAdminFooter
              onEdit={handleEdit}
              onPromote={handlePromote}
              onDelete={canDeleteProduct ? handleDelete : undefined}
              canEdit={shell.isAdmin || canSellerEditProduct(product)}
              canPromote={canPromote}
              canDelete={canDeleteProduct}
              hasOpenSales={product.hasOpenSales === true}
              isDeletePending={
                shell.deletingProductId != null &&
                shell.deletingProductId === String(product._id)
              }
              errorMessage={shell.productDetailsAdminError ?? ""}
            />
          ) : null
        }
      />
      <ReportProductModal
        isOpen={isReportModalOpen}
        productId={String(product._id)}
        productName={product.productName ?? ""}
        hasPendingReport={hasPendingReport}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitted={() => {
          queryClient.setQueryData(productReportQueryKeys.myStatus(String(product._id)), {
            hasPendingReport: true,
          });
        }}
      />
    </>
  );
}
