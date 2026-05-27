import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductDetailsAdminFooter.css";

/**
 * @param {{
 *   onEdit: () => void;
 *   canEdit?: boolean;
 *   isDeletePending?: boolean;
 * }} props
 */
export function ProductDetailsAdminFooter({
  onEdit,
  canEdit = true,
  isDeletePending = false,
}) {
  if (!canEdit) {
    return null;
  }

  return (
    <div className="product-details-admin-footer">
      <button
        type="button"
        className="product-card__edit"
        disabled={isDeletePending}
        onClick={onEdit}
      >
        {PRODUCT_CARD_UI.EDIT_PRODUCT}
      </button>
    </div>
  );
}
