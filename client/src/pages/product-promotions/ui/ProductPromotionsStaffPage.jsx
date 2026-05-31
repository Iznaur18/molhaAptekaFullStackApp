import { useCallback, useEffect, useState } from "react";

import { approveProductPromotion } from "../../../entities/product/api/approveProductPromotion.js";
import { fetchPendingProductPromotions } from "../../../entities/product/api/fetchPendingProductPromotions.js";
import { rejectProductPromotion } from "../../../entities/product/api/rejectProductPromotion.js";
import {
  API_CLIENT_UI,
  PRODUCT_PROMOTIONS_STAFF_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS } from "../../../entities/product/model/productPromotionPaymentConstants.js";

import "./ProductPromotionsStaffPage.css";

/**
 * @param {{ onQueueChanged?: () => void }} props
 */
export function ProductPromotionsStaffPage({ onQueueChanged }) {
  const [phase, setPhase] = useState("loading");
  const [promotions, setPromotions] = useState(
    /** @type {Array<{ _id: string; productId: string; productName?: string | null; tariffTitle: string; amountRub: number; amountPoints?: number | null; paymentMethod?: string }>} */ ([]),
  );
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [rowErrors, setRowErrors] = useState(/** @type {Record<string, string>} */ ({}));

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const { promotions: list } = await fetchPendingProductPromotions({
        limit: 100,
      });
      setPromotions(list);
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK,
      );
      setPhase("error");
    }
  }, [onQueueChanged]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const removeRow = (promotionId) => {
    setPromotions((prev) => prev.filter((row) => String(row._id) !== promotionId));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[promotionId];
      return next;
    });
  };

  const handleApprove = async (promotionId) => {
    try {
      setPendingId(promotionId);
      setRowErrors((prev) => ({ ...prev, [promotionId]: "" }));
      await approveProductPromotion(promotionId);
      removeRow(promotionId);
      onQueueChanged?.();
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [promotionId]:
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.APPROVE_PRODUCT_PROMOTION_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (promotionId) => {
    try {
      setPendingId(promotionId);
      setRowErrors((prev) => ({ ...prev, [promotionId]: "" }));
      await rejectProductPromotion(promotionId);
      removeRow(promotionId);
      onQueueChanged?.();
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [promotionId]:
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.REJECT_PRODUCT_PROMOTION_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  if (phase === "loading") {
    return (
      <p className="product-promotions-staff-page__state">
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.LOADING}
      </p>
    );
  }

  if (phase === "error") {
    return (
      <p className="product-promotions-staff-page__state product-promotions-staff-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (promotions.length === 0) {
    return (
      <p className="product-promotions-staff-page__state">
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <ul className="product-promotions-staff-page__list" role="list">
      {promotions.map((row) => (
        <li key={row._id} className="product-promotions-staff-page__item" role="listitem">
          <div className="product-promotions-staff-page__meta">
            <p>
              <strong>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRODUCT}:</strong>{" "}
              {row.productName?.trim() || row.productId}
            </p>
            <p>
              <strong>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_TARIFF}:</strong>{" "}
              {row.tariffTitle}
            </p>
            <p>
              <strong>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PAYMENT}:</strong>{" "}
              {row.paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS
                ? PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_POINTS
                : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_RUB}
            </p>
            <p>
              <strong>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRICE}:</strong>{" "}
              {row.amountRub} ₽
            </p>
            <p>
              <strong>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_POINTS}:</strong>{" "}
              {row.paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS &&
              row.amountPoints != null &&
              row.amountPoints > 0
                ? `${row.amountPoints} баллов`
                : "—"}
            </p>
          </div>
          {rowErrors[row._id] ? (
            <p className="product-promotions-staff-page__error" role="alert">
              {rowErrors[row._id]}
            </p>
          ) : null}
          <div className="product-promotions-staff-page__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={pendingId != null}
              onClick={() => void handleApprove(String(row._id))}
            >
              {pendingId === String(row._id)
                ? PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PENDING
                : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.APPROVE}
            </button>
            <button
              type="button"
              className="app-btn app-btn--danger product-promotions-staff-page__reject"
              disabled={pendingId != null}
              onClick={() => void handleReject(String(row._id))}
            >
              {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.REJECT}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
