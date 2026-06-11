import { useContext } from "react";

import { WishlistContext } from "./WishlistContext.jsx";

/**
 * @returns {import('./types.js').WishlistContextValue}
 */
export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used within <WishlistProvider>");
  }
  return value;
}
