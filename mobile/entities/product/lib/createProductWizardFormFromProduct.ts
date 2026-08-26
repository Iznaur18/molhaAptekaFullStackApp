import { productPickupLocationsFromProduct } from "@molha/api-contract";

import {
  createProductWizardFormFromCopiedProduct,
  type CopiedProductWizardForm,
} from "@/entities/product/lib/createProductWizardFormFromCopiedProduct";

export type ProductWizardFormFromApi = CopiedProductWizardForm;

export const createProductWizardFormFromProduct = (
  product: Record<string, unknown>,
): ProductWizardFormFromApi => {
  const base = createProductWizardFormFromCopiedProduct(product);
  const loyaltyRaw = product.loyaltyPointsPerUnit;

  return {
    ...base,
    productIsAvailable: product.productIsAvailable !== false,
    // Редактирование, в отличие от копирования, обязано поднять точки самовывоза:
    // иначе патч уйдёт с пустым списком и сотрёт то, что задано на сайте.
    productPickupLocations: productPickupLocationsFromProduct(product).map((item) => ({
      id: String(item.id ?? ""),
      label: String(item.label ?? ""),
      address: String(item.address ?? ""),
      lat: Number(item.lat),
      lon: Number(item.lon),
      isDefault: item.isDefault === true,
    })),
    loyaltyPointsPerUnit:
      loyaltyRaw != null && Number.isFinite(Number(loyaltyRaw))
        ? String(Math.max(0, Math.floor(Number(loyaltyRaw))))
        : base.loyaltyPointsPerUnit,
  };
};
