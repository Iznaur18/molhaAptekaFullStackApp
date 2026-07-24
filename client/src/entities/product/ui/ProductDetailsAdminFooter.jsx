import { Megaphone, Pencil } from "lucide-react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./ProductDetailsAdminFooter.css";

/**
 * @param {{
 *   onEdit: () => void;
 *   onPromote?: () => void;
 *   canEdit?: boolean;
 *   canPromote?: boolean;
 *   isDeletePending?: boolean;
 * }} props
 */
export function ProductDetailsAdminFooter({
  onEdit,
  onPromote,
  canEdit = true,
  canPromote = false,
  isDeletePending = false,
}) {
  if (!canEdit && !canPromote) {
    return null;
  }

  return (
    <div className="product-details-admin-footer">
      {canPromote && typeof onPromote === "function" ? (
        <button
          type="button"
          className="product-details-modal__footer-btn product-details-modal__footer-btn--promote"
          disabled={isDeletePending}
          onClick={onPromote}
        >
          <AppIcon icon={Megaphone} size="sm" strokeWidth={2.15} />
          {PRODUCT_CARD_UI.PROMOTION_BUTTON}
        </button>
      ) : null}
      {canEdit ? (
        <button
          type="button"
          className="product-details-modal__footer-btn product-details-modal__footer-btn--edit"
          disabled={isDeletePending}
          onClick={onEdit}
        >
          <AppIcon icon={Pencil} size="sm" strokeWidth={2.15} />
          {PRODUCT_CARD_UI.EDIT_PRODUCT}
        </button>
      ) : null}
    </div>
  );
}
