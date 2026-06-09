import { Pencil } from "lucide-react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

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
        className="product-details-modal__footer-btn product-details-modal__footer-btn--edit"
        disabled={isDeletePending}
        onClick={onEdit}
      >
        <AppIcon icon={Pencil} size="sm" strokeWidth={2.15} />
        {PRODUCT_CARD_UI.EDIT_PRODUCT}
      </button>
    </div>
  );
}
