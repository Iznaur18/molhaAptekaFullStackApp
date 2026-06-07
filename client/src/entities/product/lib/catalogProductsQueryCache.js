import { catalogQueryKeys } from "../model/catalogQueryKeys.js";

/** @typedef {import('../model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {import('@tanstack/react-query').InfiniteData<{
 *   products: ProductFromApi[];
 *   pagination: { page: number; limit: number; total: number; totalPages: number };
 * }> | undefined} data
 */
export function flattenCatalogProducts(data) {
  if (!data?.pages?.length) {
    return [];
  }

  const seen = new Set();
  /** @type {ProductFromApi[]} */
  const merged = [];

  for (const page of data.pages) {
    for (const product of page.products) {
      const id = String(product._id);
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      merged.push(product);
    }
  }

  return merged;
}

/**
 * @param {import('@tanstack/react-query').InfiniteData<{
 *   products: ProductFromApi[];
 *   pagination: { page: number; limit: number; total: number; totalPages: number };
 * }> | undefined} data
 * @param {(page: { products: ProductFromApi[]; pagination: { page: number; limit: number; total: number; totalPages: number } }) => { products: ProductFromApi[]; pagination: { page: number; limit: number; total: number; totalPages: number } }} mapPage
 */
function mapCatalogPages(data, mapPage) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map(mapPage),
  };
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {(product: ProductFromApi) => ProductFromApi | null} mapProduct — null удаляет товар
 */
export function patchProductInAllCatalogCaches(queryClient, productId, mapProduct) {
  const normalizedId = String(productId);

  queryClient.setQueriesData(
    { queryKey: catalogQueryKeys.all },
    (
      /** @type {import('@tanstack/react-query').InfiniteData<{ products: ProductFromApi[]; pagination: object }> | undefined} */ old,
    ) => {
      if (!old) {
        return old;
      }

      return mapCatalogPages(old, (page) => {
        /** @type {ProductFromApi[]} */
        const nextProducts = [];

        for (const product of page.products) {
          if (String(product._id) !== normalizedId) {
            nextProducts.push(product);
            continue;
          }

          const mapped = mapProduct(product);
          if (mapped) {
            nextProducts.push(mapped);
          }
        }

        return { ...page, products: nextProducts };
      });
    },
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function prependProductToAllCatalogCaches(queryClient, product) {
  const normalizedId = String(product._id);

  queryClient.setQueriesData(
    { queryKey: catalogQueryKeys.all },
    (
      /** @type {import('@tanstack/react-query').InfiniteData<{ products: ProductFromApi[]; pagination: object }> | undefined} */ old,
    ) => {
      if (!old?.pages?.length) {
        return old;
      }

      const [firstPage, ...restPages] = old.pages;
      const filtered = firstPage.products.filter((row) => String(row._id) !== normalizedId);

      return {
        ...old,
        pages: [
          {
            ...firstPage,
            products: [product, ...filtered],
            pagination: {
              ...firstPage.pagination,
              total: firstPage.pagination.total + 1,
            },
          },
          ...restPages,
        ],
      };
    },
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateCatalogProducts(queryClient) {
  return queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
}
