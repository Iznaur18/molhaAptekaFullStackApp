import { useContext } from "react";

import { WishlistContext } from "./wishlistContext";
import type { WishlistContextValue } from "./types";

export const useWishlist = (): WishlistContextValue => {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return value;
};
