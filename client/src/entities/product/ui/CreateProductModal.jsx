import { CreateProductWizard } from "../../../features/create-product-wizard/ui/CreateProductWizard.jsx";
import { EditProductModal } from "./EditProductModal.jsx";

/**
 * @typedef {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../model/types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('../model/types.js').ProductFromApi | null;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('../model/types.js').ProductFromApi[];
 * }} CreateProductModalProps
 */

/** @param {CreateProductModalProps} props */
export function CreateProductModal({ mode = "create", ...props }) {
  if (mode === "create") {
    return <CreateProductWizard {...props} />;
  }

  return <EditProductModal {...props} />;
}
