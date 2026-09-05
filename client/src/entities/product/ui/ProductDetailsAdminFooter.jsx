import { useEffect, useState } from "react";
import { Megaphone, Pencil, Trash2 } from "lucide-react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { ProductDetailsPopularListsControl } from "./ProductDetailsPopularListsControl.jsx";

import "./ProductDetailsAdminFooter.css";

/**
 * @param {{
 *   productId?: string | null;
 *   productRegionCode?: string | null;
 *   onEdit: () => void;
 *   onPromote?: () => void;
 *   onDelete?: () => void | Promise<void>;
 *   canEdit?: boolean;
 *   canPromote?: boolean;
 *   canDelete?: boolean;
 *   canManagePopularLists?: boolean;
 *   hasOpenSales?: boolean;
 *   isDeletePending?: boolean;
 *   errorMessage?: string;
 * }} props
 */
export function ProductDetailsAdminFooter({
  productId = null,
  productRegionCode = null,
  onEdit,
  onPromote,
  onDelete,
  canEdit = true,
  canPromote = false,
  canDelete = false,
  canManagePopularLists = false,
  hasOpenSales = false,
  isDeletePending = false,
  errorMessage = "",
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [onDelete]);

  if (!canEdit && !canPromote && !canDelete && !canManagePopularLists) {
    return null;
  }

  const actionsLocked = isDeletePending || isDeleteConfirmOpen;

  return (
    <div className="product-details-admin-footer">
      {errorMessage ? (
        <p className="product-details-admin-footer__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {canPromote && typeof onPromote === "function" ? (
        <button
          type="button"
          className="product-details-modal__footer-btn product-details-modal__footer-btn--promote"
          disabled={actionsLocked}
          onClick={onPromote}
        >
          <AppIcon icon={Megaphone} size="sm" strokeWidth={2.15} />
          {PRODUCT_CARD_UI.PROMOTION_BUTTON}
        </button>
      ) : null}
      {canManagePopularLists && productId ? (
        <ProductDetailsPopularListsControl
          productId={String(productId)}
          productRegionCode={productRegionCode}
          disabled={actionsLocked}
        />
      ) : null}
      {canEdit ? (
        <button
          type="button"
          className="product-details-modal__footer-btn product-details-modal__footer-btn--edit"
          disabled={actionsLocked}
          onClick={onEdit}
        >
          <AppIcon icon={Pencil} size="sm" strokeWidth={2.15} />
          {PRODUCT_CARD_UI.EDIT_PRODUCT}
        </button>
      ) : null}
      {canDelete && typeof onDelete === "function" ? (
        hasOpenSales ? (
          <p className="product-details-admin-footer__open-sales-hint">
            {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
          </p>
        ) : isDeletePending ? (
          <p className="product-details-admin-footer__delete-pending" aria-live="polite">
            {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
          </p>
        ) : isDeleteConfirmOpen ? (
          <div className="product-details-admin-footer__delete-confirm" role="group">
            <p className="product-details-admin-footer__delete-confirm-question">
              {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
            </p>
            <div className="product-details-admin-footer__delete-confirm-actions">
              <button
                type="button"
                className="product-details-modal__footer-btn product-details-modal__footer-btn--delete"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  void onDelete();
                }}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
              </button>
              <button
                type="button"
                className="product-details-modal__footer-btn product-details-modal__footer-btn--edit"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="product-details-modal__footer-btn product-details-modal__footer-btn--delete"
            disabled={isDeletePending}
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            <AppIcon icon={Trash2} size="sm" strokeWidth={2.15} />
            {PRODUCT_CARD_UI.DELETE_PRODUCT}
          </button>
        )
      ) : null}
    </div>
  );
}
