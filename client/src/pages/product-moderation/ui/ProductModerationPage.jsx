import { useCallback, useEffect, useState } from "react";

import { approveProductModeration } from "../../../entities/product/api/approveProductModeration.js";
import { fetchPendingModerationProducts } from "../../../entities/product/api/fetchPendingModerationProducts.js";
import { rejectProductModeration } from "../../../entities/product/api/rejectProductModeration.js";
import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";
import {
  API_CLIENT_UI,
  PRODUCT_MODERATION_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductModerationPage.css";

/**
 * @param {{
 *   onSellerNameClick?: (userId: string) => void;
 * }} props
 */
export function ProductModerationPage({ onSellerNameClick }) {
  const [phase, setPhase] = useState("loading");
  const [products, setProducts] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);
  const [rejectComments, setRejectComments] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [cardErrors, setCardErrors] = useState(
    /** @type {Record<string, string>} */ ({}),
  );

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const { products: list } = await fetchPendingModerationProducts({
        limit: 100,
      });
      setProducts(list);
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK,
      );
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const removeFromQueue = (productId) => {
    setProducts((prev) => prev.filter((p) => String(p._id) !== productId));
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
      setError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      await approveProductModeration(productId);
      removeFromQueue(productId);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.APPROVE_PRODUCT_MODERATION_FALLBACK;
      setError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReject = async (productId) => {
    try {
      setPendingProductId(productId);
      setError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      const comment = rejectComments[productId] ?? "";
      await rejectProductModeration(productId, comment);
      removeFromQueue(productId);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.REJECT_PRODUCT_MODERATION_FALLBACK;
      setError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
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
      {error ? (
        <p
          className="product-moderation-page__state product-moderation-page__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="home-page__grid" role="list">
        {products.map((product) => {
          const id = String(product._id);
          const isBusy = pendingProductId === id;

          return (
            <div key={id} className="home-page__cell" role="listitem">
              <ProductCard
                product={product}
                onSellerNameClick={onSellerNameClick}
                isModerationQueue
                moderationActions={{
                  rejectComment: rejectComments[id] ?? "",
                  onRejectCommentChange: (value) =>
                    setRejectComments((prev) => ({ ...prev, [id]: value })),
                  onApprove: () => void handleApprove(id),
                  onReject: () => void handleReject(id),
                  isBusy,
                  errorMessage: cardErrors[id] ?? "",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
