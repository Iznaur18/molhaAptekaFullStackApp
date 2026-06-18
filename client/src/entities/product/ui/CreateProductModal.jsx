import { CreateProductWizard } from "../../../features/create-product-wizard/ui/CreateProductWizard.jsx";
import { EditProductModal } from "./EditProductModal.jsx";

/**
 * @typedef {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../model/types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('../model/types.js').ProductFromApi | null;
 *   manageProduct?: import('../model/types.js').ProductFromApi | null;
 *   onDeleteProduct?: (productId: string) => void | Promise<void>;
 *   onSetProductAvailability?: (
 *     productId: string,
 *     productIsAvailable: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductAuction?: (
 *     productId: string,
 *     productAuctionEnabled: boolean,
 *   ) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   manageErrorMessage?: string;
 *   canManageEdit?: boolean;
 *   canManageDelete?: boolean;
 *   canManageToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
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
