import type { fetchCatalogProductsPage } from "../api/fetchCatalogProductsPage";

type CatalogProduct = Awaited<
  ReturnType<typeof fetchCatalogProductsPage>
>["products"][number];

type CatalogProductsPage = Awaited<ReturnType<typeof fetchCatalogProductsPage>>;

type CatalogProductsInfiniteData = {
  pages: CatalogProductsPage[];
};

export const flattenCatalogProducts = (
  data: CatalogProductsInfiniteData | undefined,
): CatalogProduct[] => {
  if (!data?.pages?.length) {
    return [];
  }

  const seen = new Set<string>();
  const merged: CatalogProduct[] = [];

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
};
