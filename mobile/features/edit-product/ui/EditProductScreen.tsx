import { ProductWizardScreen } from "@/features/create-product/ui/CreateProductScreen";

type EditProductScreenProps = {
  productId: string;
};

export const EditProductScreen = ({ productId }: EditProductScreenProps) => (
  <ProductWizardScreen mode="edit" productId={productId} />
);
