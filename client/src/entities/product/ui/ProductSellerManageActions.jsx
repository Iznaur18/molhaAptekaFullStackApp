import { useEffect, useState } from "react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductSellerManageActions.css";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   onEdit: () => void;
 *   onDelete: (productId: string) => void | Promise<void>;
 *   onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   errorMessage?: string;
 *   canEdit?: boolean;
 *   canDelete?: boolean;
 *   canToggleVisibility?: boolean;
 *   stopPropagationOnEdit?: boolean;
 *   className?: string;
 * }} props
 */
export function ProductSellerManageActions({
  product,
  onEdit,
  onDelete,
  onSetAvailability,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  errorMessage = "",
  canEdit = true,
  canDelete = true,
  canToggleVisibility = true,
  stopPropagationOnEdit = false,
  className = "",
}) {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const showVisibility = typeof onSetAvailability === "function" && canToggleVisibility;
  const showEdit = canEdit;
  const showDelete = canDelete;

  const actionsLocked =
    isDeletePending ||
    isAvailabilityTogglePending ||
    isDeleteConfirmOpen ||
    hasOpenSalesLocked ||
    !canEdit;

  useEffect(() => {
    setIsManageOpen(false);
    setIsDeleteConfirmOpen(false);
  }, [product._id]);

  useEffect(() => {
    if (isDeleteConfirmOpen || isDeletePending || isAvailabilityTogglePending) {
      setIsManageOpen(true);
    }
  }, [isDeleteConfirmOpen, isDeletePending, isAvailabilityTogglePending]);

  const handleToggleManage = () => {
    setIsManageOpen((open) => !open);
  };

  const handleEditClick = (event) => {
    if (stopPropagationOnEdit) {
      event.stopPropagation();
    }
    if (actionsLocked) return;
    onEdit();
  };

  const handleDeleteIntentClick = () => {
    if (hasOpenSalesLocked) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmYes = () => {
    if (product._id == null) return;
    void onDelete(String(product._id));
    setIsDeleteConfirmOpen(false);
  };

  const rootClassName = ["product-seller-manage", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      {errorMessage ? (
        <p className="product-seller-manage__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {hasOpenSalesLocked && showDelete ? (
        <p className="product-card__open-sales-hint">
          {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
        </p>
      ) : null}
      <button
        type="button"
        className="product-seller-manage__toggle product-card__edit"
        aria-expanded={isManageOpen}
        aria-controls={
          isManageOpen ? `product-seller-manage-panel-${product._id}` : undefined
        }
        onClick={handleToggleManage}
      >
        {isManageOpen
          ? PRODUCT_CARD_UI.MANAGE_PRODUCT_COLLAPSE
          : PRODUCT_CARD_UI.MANAGE_PRODUCT_TOGGLE}
      </button>
      {isManageOpen ? (
        <div
          id={`product-seller-manage-panel-${product._id}`}
          className="product-seller-manage__panel"
        >
          {showVisibility ? (
            isAvailabilityTogglePending ? (
              <p
                className="product-card__availability-pending"
                aria-live="polite"
              >
                {PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
              </p>
            ) : (
              <div className="product-card__availability">
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
              </div>
            )
          ) : null}
          {showEdit ? (
            <button
              type="button"
              className="product-card__edit"
              disabled={actionsLocked}
              onClick={handleEditClick}
            >
              {PRODUCT_CARD_UI.EDIT_PRODUCT}
            </button>
          ) : null}
          {showDelete ? (
            isDeletePending ? (
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
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
