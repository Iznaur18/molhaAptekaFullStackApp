import { ProductQaSection } from "../../../product-qa/ui/ProductQaSection.jsx";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isOwnProduct: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function ProductDetailsModalQaTab({
  productId,
  isAuthorized,
  isOwnProduct,
  onRequestLogin,
}) {
  return (
    <ProductQaSection
      productId={productId}
      isAuthorized={isAuthorized}
      isOwnProduct={isOwnProduct}
      embeddedInTab
      onRequestLogin={onRequestLogin}
    />
  );
}
