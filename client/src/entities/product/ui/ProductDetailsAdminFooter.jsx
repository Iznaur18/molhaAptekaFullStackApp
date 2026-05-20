import { useState } from "react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCard.css";
import "./ProductDetailsAdminFooter.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onEdit: () => void;
 *   onDelete: (productId: string) => void | Promise<void>;
 *   onSetAvailability: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductDetailsAdminFooter({
  product,
  onEdit,
  onDelete,
  onSetAvailability,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  errorMessage = "",
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const actionsLocked =
    isDeletePending ||
    isAvailabilityTogglePending ||
    isDeleteConfirmOpen ||
    hasOpenSalesLocked;

  const handleDeleteIntentClick = () => {
    if (hasOpenSalesLocked) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmYes = () => {
    if (product._id == null) return;
    void onDelete(String(product._id));
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="product-details-admin-footer">
      {errorMessage ? (
        <p className="product-details-admin-footer__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="product-card__availability">
        {isAvailabilityTogglePending ? (
          <p className="product-card__availability-pending" aria-live="polite">
            {PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
          </p>
        ) : (
          <>
            <p className="product-card__availability-status">
              {isListedForOthers
                ? PRODUCT_CARD_UI.AVAILABILITY_STATUS_VISIBLE
                : PRODUCT_CARD_UI.AVAILABILITY_STATUS_HIDDEN}
            </p>
            <button
              type="button"
              className="product-card__availability-toggle"
              disabled={actionsLocked}
              onClick={() => {
                if (product._id == null || actionsLocked) return;
                void onSetAvailability(
                  String(product._id),
                  !isListedForOthers,
                );
              }}
            >
              {isListedForOthers
                ? PRODUCT_CARD_UI.HIDE_FROM_CATALOG
                : PRODUCT_CARD_UI.SHOW_IN_CATALOG}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className="product-card__edit"
        disabled={actionsLocked}
        onClick={onEdit}
      >
        {PRODUCT_CARD_UI.EDIT_PRODUCT}
      </button>
      {isDeletePending ? (
        <p className="product-card__delete-pending" aria-live="polite">
          {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
        </p>
      ) : isDeleteConfirmOpen ? (
        <div className="product-card__delete-confirm" role="group">
          <p className="product-card__delete-confirm-question">
            {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
          </p>
          <div className="product-card__delete-confirm-actions">
            <button
              type="button"
              className="product-card__delete-confirm-yes"
              onClick={handleDeleteConfirmYes}
            >
              {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
            </button>
            <button
              type="button"
              className="product-card__delete-confirm-cancel"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="product-card__delete"
          disabled={hasOpenSalesLocked}
          onClick={handleDeleteIntentClick}
        >
          {PRODUCT_CARD_UI.DELETE_PRODUCT}
        </button>
      )}
    </div>
  );
}
