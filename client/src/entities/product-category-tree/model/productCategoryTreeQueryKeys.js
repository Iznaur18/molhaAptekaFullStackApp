export const productCategoryTreeQueryKeys = {
  all: ["product-category-tree"],
  roots: () => [...productCategoryTreeQueryKeys.all, "roots"],
  /**
   * @param {string} categoryId
   */
  breadcrumb: (categoryId) => [
    ...productCategoryTreeQueryKeys.all,
    "breadcrumb",
    categoryId,
  ],
  /**
   * @param {string} parentId
   */
  children: (parentId) => [...productCategoryTreeQueryKeys.all, "children", parentId],
  /**
   * @param {string} query
   */
  search: (query) => [...productCategoryTreeQueryKeys.all, "search", query],
};
