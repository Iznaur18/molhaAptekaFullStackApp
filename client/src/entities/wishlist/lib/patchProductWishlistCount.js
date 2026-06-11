import { patchProductInAllCatalogCaches } from "../../product/lib/catalogProductsQueryCache.js";
import { allProductsQueryKeys } from "../../product/model/allProductsQueryKeys.js";
import { wishlistQueryKeys } from "../model/wishlistQueryKeys.js";

/**
 * @param {import('../../product/model/types.js').ProductFromApi} product
 * @param {number} delta
 */
function mapProductWishlistCount(product, delta) {
  return {
    ...product,
    productWishlistCount: Math.max(
      0,
      Math.floor(Number(product.productWishlistCount) || 0) + delta,
    ),
  };
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 * @param {number} delta
 * @returns {() => void}
 */
export function patchProductWishlistCount(queryClient, productId, delta) {
  const id = String(productId);
  const sign = delta >= 0 ? 1 : -1;
  const magnitude = Math.abs(Math.floor(Number(delta) || 0));
  if (magnitude === 0) {
    return () => {};
  }

  const apply = (direction) => {
    const step = direction * magnitude;
    patchProductInAllCatalogCaches(queryClient, id, (product) =>
      mapProductWishlistCount(product, step),
    );

    queryClient.setQueryData(allProductsQueryKeys.list({}), (old) => {
      if (!Array.isArray(old)) {
        return old;
      }
      return old.map((product) =>
        String(product._id) === id ? mapProductWishlistCount(product, step) : product,
      );
    });

    queryClient.setQueryData(wishlistQueryKeys.my(), (old) => {
      if (!old || typeof old !== "object" || !Array.isArray(old.products)) {
        return old;
      }
      return {
        ...old,
        products: old.products.map((product) =>
          String(product._id) === id ? mapProductWishlistCount(product, step) : product,
        ),
      };
    });
  };

  apply(sign);
  return () => apply(-sign);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {import('../../product/model/types.js').ProductFromApi[]} products
 */
export function syncProductWishlistCountsFromServer(queryClient, products) {
  for (const product of products) {
    const id = String(product._id);
    const count = Math.max(0, Math.floor(Number(product.productWishlistCount) || 0));
    patchProductInAllCatalogCaches(queryClient, id, (row) => ({
      ...row,
      productWishlistCount: count,
    }));
    queryClient.setQueryData(allProductsQueryKeys.list({}), (old) => {
      if (!Array.isArray(old)) {
        return old;
      }
      return old.map((row) =>
        String(row._id) === id ? { ...row, productWishlistCount: count } : row,
      );
    });
  }
}
