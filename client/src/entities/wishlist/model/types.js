/**
 * @typedef {Record<string, number>} WishlistItemsByProductId
 */

/**
 * @typedef {{
 *   items: WishlistItemsByProductId;
 *   products: import('../../product/model/types.js').ProductFromApi[];
 * }} WishlistFromApi
 */

/**
 * @typedef {{
 *   items: WishlistItemsByProductId;
 *   addItem: (productId: string) => void;
 *   removeItem: (productId: string) => void;
 *   toggleItem: (productId: string) => void;
 *   clearWishlist: () => void;
 *   hydrateWishlist: (payload: WishlistItemsByProductId) => void;
 *   flushRemoteWishlist: () => Promise<void>;
 *   isInWishlist: (productId: string) => boolean;
 *   totalCount: number;
 * }} WishlistContextValue
 */

export {};
