import { ProductReviewsSection } from "../../../product-review/ui/ProductReviewsSection.jsx";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   isOwnProduct: boolean;
 *   onRequestLogin: () => void;
 *   onStatsChange: (stats: { averageRating?: number; reviewCount?: number }) => void;
 * }} props
 */
export function ProductDetailsModalReviewsTab({
  productId,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  onRequestLogin,
  onStatsChange,
}) {
  return (
    <ProductReviewsSection
      productId={productId}
      isAuthorized={isAuthorized}
      isUserDataConfirmed={isUserDataConfirmed}
      isOwnProduct={isOwnProduct}
      embeddedInTab
      onRequestLogin={onRequestLogin}
      onStatsChange={onStatsChange}
    />
  );
}
