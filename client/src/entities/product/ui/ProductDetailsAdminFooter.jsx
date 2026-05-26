import { ProductSellerManageActions } from "./ProductSellerManageActions.jsx";

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
 *   canEdit?: boolean;
 *   canDelete?: boolean;
 *   canToggleVisibility?: boolean;
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
  canEdit = true,
  canDelete = true,
  canToggleVisibility = true,
}) {
  return (
    <ProductSellerManageActions
      className="product-details-admin-footer"
      product={product}
      onEdit={onEdit}
      onDelete={onDelete}
      onSetAvailability={onSetAvailability}
      isDeletePending={isDeletePending}
      isAvailabilityTogglePending={isAvailabilityTogglePending}
      errorMessage={errorMessage}
      canEdit={canEdit}
      canDelete={canDelete}
      canToggleVisibility={canToggleVisibility}
    />
  );
}
