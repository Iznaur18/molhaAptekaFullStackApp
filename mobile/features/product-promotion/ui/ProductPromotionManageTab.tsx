import { ProductEditManageSection } from "@/entities/product/ui/ProductEditManageSection";

type CatalogProduct = Record<string, unknown> & { _id: string };

type ProductPromotionManageTabProps = {
  product: CatalogProduct;
  onSetAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
  onSetAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
  onSetOriginality?: (productId: string, productIsOriginal: boolean) => void | Promise<void>;
  onSetWholesale?: (productId: string, productWholesaleEnabled: boolean) => void | Promise<void>;
  onSetRental?: (productId: string, productRentalEnabled: boolean) => void | Promise<void>;
  onSetAffiliate?: (productId: string, affiliateEnabled: boolean) => void | Promise<void>;
  onSetInstallment?: (
    productId: string,
    productInstallmentEnabled: boolean,
  ) => void | Promise<void | { needsSetup?: boolean }>;
  onDelete?: (productId: string) => void | Promise<void>;
  isAvailabilityTogglePending?: boolean;
  isAuctionTogglePending?: boolean;
  isOriginalityTogglePending?: boolean;
  isWholesaleTogglePending?: boolean;
  isRentalTogglePending?: boolean;
  isAffiliateTogglePending?: boolean;
  isInstallmentTogglePending?: boolean;
  isDeletePending?: boolean;
  errorMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleVisibility?: boolean;
  sellerRaffleActive?: boolean;
  onToggleRaffleParticipation?: (product: CatalogProduct, enabled: boolean) => void;
  isRaffleParticipationPending?: boolean;
  onOpenInstallmentProgram?: () => void;
  onOpenWholesaleSettings?: () => void;
  onOpenRentalSettings?: () => void;
  onOpenAffiliateSettings?: () => void;
  isSubmitting?: boolean;
};

export const ProductPromotionManageTab = ({
  isSubmitting = false,
  ...props
}: ProductPromotionManageTabProps) => (
  <ProductEditManageSection {...props} disabled={isSubmitting} />
);
