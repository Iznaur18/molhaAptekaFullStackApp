export type WishlistItemsByProductId = Record<string, number>;

export type WishlistFromApi = {
  items: WishlistItemsByProductId;
  products: Array<Record<string, unknown>>;
};

export type WishlistContextValue = {
  items: WishlistItemsByProductId;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  clearWishlist: () => void;
  hydrateWishlist: (payload: WishlistItemsByProductId) => void;
  flushRemoteWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  totalCount: number;
};
