/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateCuratedProductLists(queryClient) {
  await queryClient.invalidateQueries({ queryKey: ["curated-product-lists"] });
}
