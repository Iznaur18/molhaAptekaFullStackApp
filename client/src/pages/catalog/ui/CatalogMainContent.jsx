/**
 * @param {{
 *   catalogMainView: 'catalog' | 'catalog-browser';
 *   catalogGridSection: import('react').ReactNode;
 *   catalogBrowserSection: import('react').ReactNode;
 * }} props
 */
export function CatalogMainContent({
  catalogMainView,
  catalogGridSection,
  catalogBrowserSection,
}) {
  if (catalogMainView === "catalog-browser") {
    return catalogBrowserSection;
  }
  return catalogGridSection;
}
