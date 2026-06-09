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
    for (const product of page.products ?? []) {
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
function isCatalogInfiniteData(data) {
  return Boolean(data && Array.isArray(data.pages));
}

function mapCatalogPages(data, mapPage) {
  if (!isCatalogInfiniteData(data)) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map(mapPage),
  };
}

/**
 * @param {ProductFromApi | import('@tanstack/react-query').InfiniteData<{ products: ProductFromApi[]; pagination: object }> | undefined} data
 * @param {string} productId
 * @param {(product: ProductFromApi) => ProductFromApi | null} mapProduct
 */
export function patchCatalogQueryData(data, productId, mapProduct) {
  if (!data) {
    return data;
  }

  const normalizedId = String(productId);

  if (!isCatalogInfiniteData(data)) {
    if (data._id == null || String(data._id) !== normalizedId) {
      return data;
    }

    const mapped = mapProduct(data);
    return mapped ?? data;
  }

  return mapCatalogPages(data, (page) => {
    /** @type {ProductFromApi[]} */
    const nextProducts = [];

    for (const product of page.products ?? []) {
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
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {(product: ProductFromApi) => ProductFromApi | null} mapProduct — null удаляет товар
 */
export function patchProductInAllCatalogCaches(queryClient, productId, mapProduct) {
  queryClient.setQueriesData(
    { queryKey: catalogQueryKeys.all },
    (
      /** @type {ProductFromApi | import('@tanstack/react-query').InfiniteData<{ products: ProductFromApi[]; pagination: object }> | undefined} */ old,
    ) => patchCatalogQueryData(old, productId, mapProduct),
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
