import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { ProductMediaGalleryReadonly } from "../ProductMediaGalleryReadonly.jsx";
import { ProductShareLinkButton } from "./ProductShareLinkButton.jsx";

/**
 * Галерея над табами — паритет с mobile product detail screen.
 *
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { productWishlistCount?: number },
 *   ) => void;
 *   currentUserId?: string | null;
 *   reportOverlay?: import('react').ReactNode;
 *   ctrl: ReturnType<import('./useProductDetailsModalController.js').useProductDetailsModalController>;
 * }} props
 */
export function ProductDetailsModalPinnedGallery({
  product,
  isOpen,
  isAuthorized,
  onRequestLogin,
  onProductStatsUpdate,
  currentUserId = null,
  reportOverlay = null,
  ctrl,
}) {
  const { imageUrls, previewVideoUrl, fieldHandlers, isOwnProduct } = ctrl;

  return (
    <ProductMediaGalleryReadonly
      imageUrls={imageUrls}
      previewVideoUrl={previewVideoUrl}
      product={product}
      isActive={isOpen}
      resetToken={product._id}
      onBack={fieldHandlers.onClose}
      heroOverlay={
        <div className="product-media-gallery-readonly__hero-actions">
          {reportOverlay ? (
            <div className="product-media-gallery-readonly__report-slot">{reportOverlay}</div>
          ) : null}
          <ProductShareLinkButton product={product} />
          {!isOwnProduct ? (
            <WishlistToggleButton
              productId={String(product._id)}
              product={product}
              isAuthorized={isAuthorized}
              onRequestLogin={onRequestLogin}
              currentUserId={currentUserId}
              onProductStatsUpdate={onProductStatsUpdate}
              variant="card"
            />
          ) : null}
        </div>
      }
    />
  );
}
