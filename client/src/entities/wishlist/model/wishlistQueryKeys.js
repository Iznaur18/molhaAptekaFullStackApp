export const wishlistQueryKeys = {
  all: ["wishlist"],
  my: () => [...wishlistQueryKeys.all, "my"],
};
