import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { usePendingProductPromotionsQuery } from "../../../entities/product-promotion/model/usePendingProductPromotionsQuery.js";
import { useProductPromotionStaffMutations } from "../../../entities/product-promotion/model/useProductPromotionStaffMutations.js";
import { productPromotionQueryKeys } from "../../../entities/product-promotion/model/productPromotionQueryKeys.js";
import { syncProductPromotionsStaffQueueCaches } from "../../../pages/home/lib/staffBadgeQueryCache.js";
import {
  API_CLIENT_UI,
  PRODUCT_PROMOTIONS_STAFF_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductPromotionsStaffPage.css";

const PAYMENT_METHOD_POINTS = "points";
const PAYMENT_METHOD_RUB = "rub";

/**
 * @param {string | undefined} paymentMethod
 */
function formatPaymentLabel(paymentMethod) {
  if (paymentMethod === PAYMENT_METHOD_RUB) {
    return PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_RUB;
  }
  if (paymentMethod === PAYMENT_METHOD_POINTS) {
    return PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_POINTS;
  }
  return "—";
}

/**
 * @param {{ onQueueChanged?: () => void }} props
 */
export function ProductPromotionsStaffPage({ onQueueChanged }) {
  const queryClient = useQueryClient();
  const queueQuery = usePendingProductPromotionsQuery();
  const { approveMutation, rejectMutation } = useProductPromotionStaffMutations();
  const [pendingId, setPendingId] = useState(null);
  const [rowErrors, setRowErrors] = useState(/** @type {Record<string, string>} */ ({}));

  const promotions = queueQuery.data ?? [];

  const removeRow = (promotionId) => {
    queryClient.setQueryData(
      productPromotionQueryKeys.staffPending(),
      (/** @type {Record<string, unknown>[] | undefined} */ old) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return old.filter((row) => String(row._id) !== promotionId);
      },
    );
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
      await approveMutation.mutateAsync(promotionId);
      removeRow(promotionId);
      void syncProductPromotionsStaffQueueCaches(queryClient);
      onQueueChanged?.();
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [promotionId]:
          e instanceof Error ? e.message : API_CLIENT_UI.APPROVE_PRODUCT_PROMOTION_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (promotionId) => {
    try {
      setPendingId(promotionId);
      setRowErrors((prev) => ({ ...prev, [promotionId]: "" }));
      await rejectMutation.mutateAsync(promotionId);
      removeRow(promotionId);
      void syncProductPromotionsStaffQueueCaches(queryClient);
      onQueueChanged?.();
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [promotionId]:
          e instanceof Error ? e.message : API_CLIENT_UI.REJECT_PRODUCT_PROMOTION_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  if (queueQuery.isPending) {
    return (
      <p className="product-promotions-staff-page__state">
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.LOADING}
      </p>
    );
  }

  if (queueQuery.isError) {
    const message =
      queueQuery.error instanceof Error
        ? queueQuery.error.message
        : API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_QUEUE_FALLBACK;
    return (
      <p
        className="product-promotions-staff-page__state product-promotions-staff-page__state_error"
        role="alert"
      >
        {message}
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
    <div className="product-promotions-staff-page">
      <ul className="product-promotions-staff-page__list">
        {promotions.map((promotion) => {
          const promotionId = String(promotion._id);
          const busy = pendingId === promotionId;
          return (
            <li key={promotionId} className="product-promotions-staff-page__row">
              <p className="product-promotions-staff-page__title">
                {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRODUCT}:{" "}
                {promotion.productName ?? "—"}
              </p>
              <p className="product-promotions-staff-page__meta">
                {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_TARIFF}:{" "}
                {promotion.tariffTitle ?? "—"}
              </p>
              <p className="product-promotions-staff-page__meta">
                {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRICE}: {promotion.amountRub ?? "—"}
              </p>
              {promotion.paymentMethod === PAYMENT_METHOD_POINTS ? (
                <p className="product-promotions-staff-page__meta">
                  {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_POINTS}:{" "}
                  {promotion.amountPoints ?? "—"}
                </p>
              ) : null}
              <p className="product-promotions-staff-page__meta">
                {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PAYMENT}:{" "}
                {formatPaymentLabel(promotion.paymentMethod)}
              </p>
              <p className="product-promotions-staff-page__meta">
                Продавец: {promotion.seller?.userName ?? "—"}
              </p>
              {rowErrors[promotionId] ? (
                <p className="product-promotions-staff-page__row-error" role="alert">
                  {rowErrors[promotionId]}
                </p>
              ) : null}
              <div className="product-promotions-staff-page__actions">
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  disabled={busy}
                  onClick={() => void handleApprove(promotionId)}
                >
                  {busy
                    ? PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PENDING
                    : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.APPROVE}
                </button>
                <button
                  type="button"
                  className="product-promotions-staff-page__reject"
                  disabled={busy}
                  onClick={() => void handleReject(promotionId)}
                >
                  {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.REJECT}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
