/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateCuratedCategoryLists(queryClient) {
  await queryClient.invalidateQueries({ queryKey: ["curated-category-lists"] });
}
