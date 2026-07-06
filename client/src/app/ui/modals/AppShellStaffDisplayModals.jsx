import { EditProductCatalogFeedTileDisplayModal } from "../../../entities/product-category-display/ui/EditProductCatalogFeedTileDisplayModal.jsx";
import { EditProductCategoryDisplayModal } from "../../../entities/product-category-display/ui/EditProductCategoryDisplayModal.jsx";
import { EditProductCategoryNodeDisplayModal } from "../../../entities/product-category-display/ui/EditProductCategoryNodeDisplayModal.jsx";

/**
 * @param {{
 *   editingCategorySlug: string | null;
 *   setEditingCategorySlug: (slug: string | null) => void;
 *   editingCategoryNode: { categoryId: string; fallbackLabel: string } | null;
 *   setEditingCategoryNode: (payload: { categoryId: string; fallbackLabel: string } | null) => void;
 *   categoryDisplays: import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[];
 *   categoryRoots: import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode[];
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
  editingCategoryNode,
  setEditingCategoryNode,
  categoryDisplays,
  categoryRoots,
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
        categoryRoots={categoryRoots}
        displays={categoryDisplays}
        onClose={() => setEditingCategorySlug(null)}
        onSaved={handleCategoryDisplaySaved}
      />
      <EditProductCategoryNodeDisplayModal
        isOpen={editingCategoryNode != null}
        categoryId={editingCategoryNode?.categoryId ?? null}
        fallbackLabel={editingCategoryNode?.fallbackLabel ?? null}
        displays={categoryDisplays}
        onClose={() => setEditingCategoryNode(null)}
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
