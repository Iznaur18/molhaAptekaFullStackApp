import { isSellerProductLoyaltyPointsOvercommitted } from "../../../entities/product/lib/isSellerProductLoyaltyPointsOvercommitted.js";
import { ProductCard } from "../../../entities/product/ui/ProductCard.jsx";

/**
 * @param {{
 *   product: import('../../../entities/product/model/types.js').ProductFromApi;
 *   products: import('../../../entities/product/model/types.js').ProductFromApi[];
 *   isMineMode: boolean;
 *   deletingProductId: string | null;
 *   onSellerNameClick: (userId: string) => void;
 *   onDeleteMyProduct: (productId: string) => void;
 *   onEditMyProduct?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onPromoteMyProduct?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onOpenProductDetails: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onSetMyProductAvailability?: (productId: string, productIsAvailable: boolean) => void | Promise<void>;
 *   onSetMyProductAuction?: (productId: string, productAuctionEnabled: boolean) => void | Promise<void>;
 *   togglingAvailabilityProductId: string | null;
 *   togglingAuctionProductId: string | null;
 *   isAuthorized: boolean;
 *   isPremiumUser: boolean;
 *   currentUserId: string | null;
 *   onRequestLoginAddToCart: () => void;
 *   showAddToCartOnCard: boolean;
 *   promotionFullWidth?: boolean;
 *   highlightRaffleProducts: boolean;
 *   sellerRaffleActive: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../../../entities/product/model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   raffleParticipationPendingProductId: string | null;
 *   sellerLoyaltyPointsBalance: number;
 *   sellerLoyaltyPointsReserved: number;
 * }} props
 */
export function CatalogGridProductCard({
  product,
  products,
  isMineMode,
  deletingProductId,
  onSellerNameClick,
  onDeleteMyProduct,
  onEditMyProduct,
  onPromoteMyProduct,
  onOpenProductDetails,
  onSetMyProductAvailability,
  onSetMyProductAuction,
  togglingAvailabilityProductId,
  togglingAuctionProductId,
  isAuthorized,
  isPremiumUser,
  currentUserId,
  onRequestLoginAddToCart,
  showAddToCartOnCard,
  promotionFullWidth = false,
  highlightRaffleProducts,
  sellerRaffleActive,
  onToggleRaffleParticipation,
  raffleParticipationPendingProductId,
  sellerLoyaltyPointsBalance,
  sellerLoyaltyPointsReserved,
}) {
  const productId = product._id != null ? String(product._id) : "";

  return (
    <div
      className={
        promotionFullWidth ? "app-shell__cell app-shell__cell--tier3-full-width" : "app-shell__cell"
      }
      role="listitem"
    >
      <ProductCard
        product={product}
        onSellerNameClick={onSellerNameClick}
        onDeleteProduct={isMineMode ? onDeleteMyProduct : undefined}
        onEditProduct={isMineMode ? onEditMyProduct : undefined}
        isDeletePending={deletingProductId === productId}
        onSetProductAvailability={isMineMode ? onSetMyProductAvailability : undefined}
        onSetProductAuction={isMineMode ? onSetMyProductAuction : undefined}
        onPromoteProduct={isMineMode ? onPromoteMyProduct : undefined}
        isAvailabilityTogglePending={togglingAvailabilityProductId === productId}
        isAuctionTogglePending={togglingAuctionProductId === productId}
        onOpenDetails={onOpenProductDetails}
        isAuthorized={isAuthorized}
        isPremiumUser={isPremiumUser}
        currentUserId={currentUserId}
        onRequestLoginAddToCart={onRequestLoginAddToCart}
        showAddToCartOnCard={showAddToCartOnCard}
        isMineMode={isMineMode}
        highlightCatalogPromotion={!isMineMode}
        promotionFullWidth={promotionFullWidth}
        highlightRaffleProduct={highlightRaffleProducts}
        sellerRaffleActive={isMineMode ? sellerRaffleActive : false}
        onToggleRaffleParticipation={isMineMode ? onToggleRaffleParticipation : undefined}
        isRaffleParticipationPending={
          isMineMode &&
          product._id != null &&
          raffleParticipationPendingProductId === productId
        }
        isLoyaltyPointsOvercommitted={
          isMineMode &&
          isSellerProductLoyaltyPointsOvercommitted(product, {
            loyaltyPointsBalance: sellerLoyaltyPointsBalance,
            loyaltyPointsReserved: sellerLoyaltyPointsReserved,
            sellerProducts: products,
          })
        }
      />
    </div>
  );
}
