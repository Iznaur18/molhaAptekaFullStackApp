import { sumSellerCatalogLoyaltyPointsPerUnit } from "@/entities/product/lib/sumSellerCatalogLoyaltyPointsPerUnit";

type ResolveSellerMaxLoyaltyPointsPerUnitParams = {
  loyaltyPointsBalance: number;
  loyaltyPointsReserved?: number;
  sellerProducts?: { _id?: string }[];
  editingProductId?: string | null;
};

export const resolveSellerMaxLoyaltyPointsPerUnit = ({
  loyaltyPointsBalance,
  loyaltyPointsReserved = 0,
  sellerProducts = [],
  editingProductId = null,
}: ResolveSellerMaxLoyaltyPointsPerUnitParams) => {
  const balance = Math.max(0, Math.floor(Number(loyaltyPointsBalance)) || 0);
  const reserved = Math.max(0, Math.floor(Number(loyaltyPointsReserved)) || 0);
  const available = Math.max(0, balance - reserved);
  const catalogCommitted = sumSellerCatalogLoyaltyPointsPerUnit(
    sellerProducts,
    editingProductId,
  );
  const maxPerUnit = Math.max(0, available - catalogCommitted);

  return {
    available,
    catalogCommitted,
    maxPerUnit,
  };
};
