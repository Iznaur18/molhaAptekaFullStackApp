import { ProductCardBody } from "./product-card/ProductCardBody.jsx";
import { useProductCardDetailsSurface } from "./product-card/useProductCardDetailsSurface.js";
import { useProductCardViewModel } from "./product-card/useProductCardViewModel.js";

import "./ProductCard.css";

/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @param {(userId: string) => void} [onSellerNameClick]
 * @param {(productId: string) => void | Promise<void>} [onDeleteProduct]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [onEditProduct]
 * @param {boolean} [isDeletePending]
 * @param {(productId: string, productIsAvailable: boolean) => void | Promise<void>} [onSetProductAvailability]
 * @param {(productId: string, productAuctionEnabled: boolean) => void | Promise<void>} [onSetProductAuction]
 * @param {boolean} [isAvailabilityTogglePending]
 * @param {boolean} [isAuctionTogglePending]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [onPromoteProduct]
 * @param {boolean} [sellerRaffleActive]
 * @param {(product: import('../model/types.js').ProductFromApi, enabled: boolean) => void} [onToggleRaffleParticipation]
 * @param {boolean} [isRaffleParticipationPending]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [onOpenDetails]
 * @param {boolean} [isAuthorized]
 * @param {boolean} [isPremiumUser]
 * @param {string | null} [currentUserId]
 * @param {() => void} [onRequestLoginAddToCart]
 * @param {boolean} [isMineMode]
 * @param {boolean} [highlightCatalogPromotion]
 * @param {boolean} [promotionFullWidth]
 * @param {string | null} [viewerRegionCode]
 * @param {boolean} [highlightRaffleProduct]
 * @param {boolean} [isLoyaltyPointsOvercommitted]
 * @param {boolean} [isModerationQueue]
 * @param {{
 *   rejectComment: string;
 *   onRejectCommentChange: (value: string) => void;
 *   onApprove: () => void;
 *   onReject: () => void;
 *   onDelete?: () => void | Promise<void>;
 *   canDelete?: boolean;
 *   hasOpenSales?: boolean;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * } | null} [moderationActions]
 */
export function ProductCard(props) {
  const vm = useProductCardViewModel(props);
  const detailsSurface = useProductCardDetailsSurface({ vm });
  const card = <ProductCardBody vm={vm} detailsSurface={detailsSurface} />;

  if (!vm.showPromotionChrome && !vm.showPremiumChrome) {
    return card;
  }

  return <div className={vm.frameClassName}>{card}</div>;
}
