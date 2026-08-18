import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useMyProductMutations } from "../../../entities/product/model/useMyProductMutations.js";
import { useProductModerationMutations } from "../../../entities/product/model/useProductModerationMutations.js";
import { moderationQueryKeys } from "../../../entities/product/model/moderationQueryKeys.js";
import { usePendingModerationProductsQuery } from "../../../entities/product/model/usePendingModerationProductsQuery.js";
import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";
import { ProductModerationCreateDetailsModal } from "../../../entities/product/ui/ProductModerationCreateDetailsModal.jsx";
import {
  API_CLIENT_UI,
  PRODUCT_MODERATION_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductModerationPage.css";

const MODERATION_QUEUE_LIMIT = 100;

/**
 * @param {{
 *   onSellerNameClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 *   isAdmin?: boolean;
 * }} props
 */
export function ProductModerationPage({
  onSellerNameClick,
  onQueueChanged,
  isAdmin = false,
}) {
  const queryClient = useQueryClient();
  const { approveMutation, rejectMutation } = useProductModerationMutations();
  const { deleteMutation } = useMyProductMutations();
  const queueQuery = usePendingModerationProductsQuery({ limit: MODERATION_QUEUE_LIMIT });
  const [actionError, setActionError] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);
  const [rejectComments, setRejectComments] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [cardErrors, setCardErrors] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [openProductId, setOpenProductId] = useState(/** @type {string | null} */ (null));

  const products = queueQuery.data?.products ?? [];
  const openProduct =
    products.find((product) => String(product._id) === openProductId) ?? null;
  const phase = queueQuery.isPending
    ? "loading"
    : queueQuery.isError && products.length === 0
      ? "error"
      : "success";
  const error =
    queueQuery.error instanceof Error
      ? queueQuery.error.message
      : API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK;

  const removeFromQueue = (productId) => {
    queryClient.setQueryData(
      moderationQueryKeys.pending({ limit: MODERATION_QUEUE_LIMIT }),
      (old) => {
        if (!old?.products) {
          return old;
        }
        return {
          ...old,
          products: old.products.filter((product) => String(product._id) !== productId),
        };
      },
    );
    setRejectComments((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleApprove = async (productId) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      await approveMutation.mutateAsync(productId);
      removeFromQueue(productId);
      onQueueChanged?.();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.APPROVE_PRODUCT_MODERATION_FALLBACK;
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReject = async (productId) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      const comment = rejectComments[productId] ?? "";
      await rejectMutation.mutateAsync({ productId, comment });
      removeFromQueue(productId);
      onQueueChanged?.();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.REJECT_PRODUCT_MODERATION_FALLBACK;
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      await deleteMutation.mutateAsync(productId);
      removeFromQueue(productId);
      onQueueChanged?.();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK;
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const getModerationActions = (product) => {
    const id = String(product._id);
    return {
      rejectComment: rejectComments[id] ?? "",
      onRejectCommentChange: (value) =>
        setRejectComments((prev) => ({ ...prev, [id]: value })),
      onApprove: () => void handleApprove(id),
      onReject: () => void handleReject(id),
      onDelete: isAdmin ? () => void handleDelete(id) : undefined,
      canDelete: isAdmin,
      hasOpenSales: product.hasOpenSales === true,
      isBusy: pendingProductId === id,
      errorMessage: cardErrors[id] ?? "",
    };
  };

  if (phase === "loading") {
    return (
      <p className="product-moderation-page__state">
        {PRODUCT_MODERATION_PAGE_UI.LOADING}
      </p>
    );
  }

  if (phase === "error" && products.length === 0) {
    return (
      <p
        className="product-moderation-page__state product-moderation-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="product-moderation-page__state">
        {PRODUCT_MODERATION_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <div className="product-moderation-page">
      {actionError ? (
        <p
          className="product-moderation-page__state product-moderation-page__state_error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
      <div
        className="product-moderation-page__list"
        role="list"
        aria-label={PRODUCT_MODERATION_PAGE_UI.PRODUCTS_LIST_ARIA}
      >
        {products.map((product) => {
          const id = String(product._id);

          return (
            <div key={id} className="product-moderation-page__item" role="listitem">
              <ProductCard
                product={product}
                onSellerNameClick={onSellerNameClick}
                onOpenDetails={() => setOpenProductId(id)}
                isModerationQueue
                moderationActions={getModerationActions(product)}
              />
            </div>
          );
        })}
      </div>
      <ProductModerationCreateDetailsModal
        product={openProduct}
        isOpen={openProduct != null}
        onClose={() => setOpenProductId(null)}
        onSellerNameClick={onSellerNameClick}
      />
    </div>
  );
}
