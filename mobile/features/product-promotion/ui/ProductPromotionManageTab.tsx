import { ProductEditManageSection } from "@/entities/product/ui/ProductEditManageSection";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductPromotionManageTabProps = {
  product: CatalogProduct;
  onDelete: (productId: string) => void | Promise<void>;
  onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
  onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
  isDeletePending?: boolean;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  errorMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleVisibility?: boolean;
  sellerRaffleActive?: boolean;
  onToggleRaffleParticipation?: (product: CatalogProduct, enabled: boolean) => void;
  isRaffleParticipationPending?: boolean;
  onOpenInstallmentProgram?: () => void;
  isSubmitting?: boolean;
};

export const ProductPromotionManageTab = ({
  isSubmitting = false,
  ...props
}: ProductPromotionManageTabProps) => (
  <ProductEditManageSection {...props} disabled={isSubmitting} />
);
