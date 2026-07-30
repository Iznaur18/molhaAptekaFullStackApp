import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { AdminPanelShell } from "../../../shared/ui/AdminPanel/AdminPanelShell.jsx";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useCategoryTreeAdminPage } from "../model/useCategoryTreeAdminPage.js";
import { CategoryTreeAdminCard } from "./CategoryTreeAdminCard.jsx";

export function CategoryTreeAdminPage() {
  const {
    rows,
    phase,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    pendingId,
    editingId,
    editDraft,
    newSlug,
    setNewSlug,
    newLabelRu,
    setNewLabelRu,
    newParentId,
    setNewParentId,
    newIsLeaf,
    setNewIsLeaf,
    newKeywordsCsv,
    setNewKeywordsCsv,
    newCharacteristicKeysText,
    setNewCharacteristicKeysText,
    newLegacySlug,
    setNewLegacySlug,
    displayError,
    isCreateRoot,
    parentOptions,
    filteredRows,
    patchDraft,
    cancelEdit,
    startEdit,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    reloadRows,
  } = useCategoryTreeAdminPage();

  const createPanel = (
    <form className="admin-panel__create-form" onSubmit={handleCreate}>
      <div className="admin-panel__form-grid">
        <label className="admin-panel__field admin-panel__field_full">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</span>
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="automobiles"
            required
          />
          <small className="admin-panel__field-hint">
            {CATEGORY_TREE_ADMIN_PAGE_UI.SLUG_HINT}
          </small>
        </label>
        <label className="admin-panel__field">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</span>
          <input
            value={newLabelRu}
            onChange={(e) => setNewLabelRu(e.target.value)}
            required
          />
        </label>
        <label className="admin-panel__field">
          <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</span>
          <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
            <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.PARENT_ROOT}</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {isCreateRoot ? null : (
          <>
            <label className="admin-panel__field admin-panel__field_row">
              <input
                type="checkbox"
                checked={newIsLeaf}
                onChange={(e) => setNewIsLeaf(e.target.checked)}
              />
              <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</span>
            </label>
            <label className="admin-panel__field admin-panel__field_full">
              <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</span>
              <input
                value={newKeywordsCsv}
                onChange={(e) => setNewKeywordsCsv(e.target.value)}
                placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
              />
            </label>
            {newIsLeaf ? (
              <label className="admin-panel__field admin-panel__field_full">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_DEFAULT_CHARACTERISTICS}</span>
                <textarea
                  value={newCharacteristicKeysText}
                  onChange={(e) => setNewCharacteristicKeysText(e.target.value)}
                  placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.DEFAULT_CHARACTERISTICS_PLACEHOLDER}
                  rows={5}
                />
                <small className="admin-panel__field-hint">
                  {CATEGORY_TREE_ADMIN_PAGE_UI.DEFAULT_CHARACTERISTICS_HINT}
                </small>
              </label>
            ) : null}
            <label className="admin-panel__field">
              <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEGACY}</span>
              <select
                value={newLegacySlug}
                onChange={(e) => setNewLegacySlug(e.target.value)}
              >
                <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.LEGACY_NONE}</option>
                {PRODUCT_CATEGORIES.map((slug) => (
                  <option key={slug} value={slug}>
                    {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
      <div className="admin-panel__create-actions">
        <button
          type="submit"
          className="app-btn app-btn--primary"
          disabled={pendingId === "create"}
        >
          {CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_BUTTON}
        </button>
      </div>
    </form>
  );

  const listContent = (() => {
    if (phase === "success" && rows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY}
        </p>
      );
    }
    if (phase === "success" && filteredRows.length === 0) {
      return (
        <p className="admin-panel__alert admin-panel__alert_info">
          {CATEGORY_TREE_ADMIN_PAGE_UI.EMPTY_FILTER}
        </p>
      );
    }
    if (filteredRows.length === 0) {
      return null;
    }
    return (
      <ul className="admin-panel__list">
        {filteredRows.map((row) => (
          <CategoryTreeAdminCard
            key={row._id}
            row={row}
            parentOptions={parentOptions}
            isEditing={editingId === row._id}
            isPending={pendingId === row._id}
            editDraft={editDraft}
            onDraftChange={patchDraft}
            onStartEdit={() => startEdit(row)}
            onCancelEdit={cancelEdit}
            onSave={() => void handleSaveEdit(row)}
            onDelete={() => void handleDelete(row)}
          />
        ))}
      </ul>
    );
  })();

  return (
    <AdminPanelShell
      title={CATEGORY_TREE_ADMIN_PAGE_UI.TITLE}
      hint={CATEGORY_TREE_ADMIN_PAGE_UI.HINT}
      count={rows.length}
      filteredCount={searchQuery.trim() ? filteredRows.length : undefined}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={CATEGORY_TREE_ADMIN_PAGE_UI.SEARCH_PLACEHOLDER}
      onRefresh={() => void reloadRows({ silent: true })}
      isLoading={phase === "loading"}
      isRefreshing={isRefreshing}
      error={displayError}
      isCreateOpen={isCreateOpen}
      onToggleCreate={() => setIsCreateOpen((open) => !open)}
      createHeading={CATEGORY_TREE_ADMIN_PAGE_UI.CREATE_HEADING}
      createPanel={createPanel}
    >
      {listContent}
    </AdminPanelShell>
  );
}
