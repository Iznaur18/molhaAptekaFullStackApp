import { EditProductCatalogFeedTileDisplayModal } from "../../../entities/product-category-display/ui/EditProductCatalogFeedTileDisplayModal.jsx";
import { EditProductCategoryDisplayModal } from "../../../entities/product-category-display/ui/EditProductCategoryDisplayModal.jsx";

/**
 * @param {{
 *   editingCategorySlug: string | null;
 *   setEditingCategorySlug: (slug: string | null) => void;
 *   categoryDisplays: import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[];
 *   handleCategoryDisplaySaved: () => void;
 *   editingFeedTileKey: string | null;
 *   setEditingFeedTileKey: (tileKey: string | null) => void;
 *   feedTileDisplays: import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   handleFeedTileDisplaySaved: (display: import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi) => void;
 * }} props
 */
export function AppShellStaffDisplayModals({
  editingCategorySlug,
  setEditingCategorySlug,
  categoryDisplays,
  handleCategoryDisplaySaved,
  editingFeedTileKey,
  setEditingFeedTileKey,
  feedTileDisplays,
  handleFeedTileDisplaySaved,
}) {
  return (
    <>
      <EditProductCategoryDisplayModal
        isOpen={editingCategorySlug != null}
        categorySlug={editingCategorySlug}
        displays={categoryDisplays}
        onClose={() => setEditingCategorySlug(null)}
        onSaved={handleCategoryDisplaySaved}
      />
      <EditProductCatalogFeedTileDisplayModal
        isOpen={editingFeedTileKey != null}
        tileKey={editingFeedTileKey}
        displays={feedTileDisplays}
        onClose={() => setEditingFeedTileKey(null)}
        onSaved={handleFeedTileDisplaySaved}
      />
    </>
  );
}
