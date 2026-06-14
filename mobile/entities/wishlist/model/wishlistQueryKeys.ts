export const wishlistQueryKeys = {
  all: ["wishlist"] as const,
  my: () => [...wishlistQueryKeys.all, "my"] as const,
};
