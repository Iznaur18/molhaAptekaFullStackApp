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
    loyaltyPointsPerUnit:
      loyaltyRaw != null && Number.isFinite(Number(loyaltyRaw))
        ? String(Math.max(0, Math.floor(Number(loyaltyRaw))))
        : base.loyaltyPointsPerUnit,
  };
};
