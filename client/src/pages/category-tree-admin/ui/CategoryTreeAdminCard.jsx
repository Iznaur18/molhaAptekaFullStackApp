import { memo } from "react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatCategoryPath } from "../lib/categoryTreeAdminUtils.js";

/**
 * @param {{
 *   row: import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow;
 *   parentOptions: { id: string; label: string }[];
 *   isEditing: boolean;
 *   isPending: boolean;
 *   editDraft: Record<string, string | boolean>;
 *   onDraftChange: (patch: Record<string, string | boolean>) => void;
 *   onStartEdit: () => void;
 *   onCancelEdit: () => void;
 *   onSave: () => void;
 *   onDelete: () => void;
 * }} props
 */
export const CategoryTreeAdminCard = memo(function CategoryTreeAdminCard({
  row,
  parentOptions,
  isEditing,
  isPending,
  editDraft,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) {
  const pathLabel = formatCategoryPath(row);
  const keywords = row.searchKeywords ?? [];
  const defaultCharacteristicKeys = row.defaultCharacteristicKeys ?? [];

  return (
    <li
      className={["admin-panel__card", isEditing ? "admin-panel__card_editing" : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ marginLeft: `${Math.min(row.depth, 6) * 10}px` }}
    >
      <div className="admin-panel__card-body">
        {isEditing ? (
          <>
            <div className="admin-panel__edit-grid">
              <label className="admin-panel__field">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</span>
                <input
                  value={String(editDraft.labelRu ?? "")}
                  onChange={(e) => onDraftChange({ labelRu: e.target.value })}
                />
              </label>
              <label className="admin-panel__field">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</span>
                <input
                  value={String(editDraft.slug ?? "")}
                  onChange={(e) => onDraftChange({ slug: e.target.value })}
                />
              </label>
              <label className="admin-panel__field admin-panel__field_full">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</span>
                <select
                  value={String(editDraft.parentId ?? "")}
                  onChange={(e) => onDraftChange({ parentId: e.target.value })}
                >
                  <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.PARENT_ROOT}</option>
                  {parentOptions
                    .filter((item) => item.id !== row._id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="admin-panel__field admin-panel__field_row">
                <input
                  type="checkbox"
                  checked={editDraft.isLeaf === true}
                  onChange={(e) => onDraftChange({ isLeaf: e.target.checked })}
                />
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</span>
              </label>
              <label className="admin-panel__field">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEGACY}</span>
                <select
                  value={String(editDraft.legacyProductCategory ?? "")}
                  onChange={(e) =>
                    onDraftChange({ legacyProductCategory: e.target.value })
                  }
                >
                  <option value="">{CATEGORY_TREE_ADMIN_PAGE_UI.LEGACY_NONE}</option>
                  {PRODUCT_CATEGORIES.map((slug) => (
                    <option key={slug} value={slug}>
                      {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-panel__field admin-panel__field_full">
                <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</span>
                <input
                  value={String(editDraft.keywordsCsv ?? "")}
                  onChange={(e) => onDraftChange({ keywordsCsv: e.target.value })}
                  placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
                />
              </label>
              {editDraft.isLeaf === true ? (
                <label className="admin-panel__field admin-panel__field_full">
                  <span>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_DEFAULT_CHARACTERISTICS}</span>
                  <textarea
                    value={String(editDraft.characteristicKeysText ?? "")}
                    onChange={(e) =>
                      onDraftChange({ characteristicKeysText: e.target.value })
                    }
                    placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.DEFAULT_CHARACTERISTICS_PLACEHOLDER}
                    rows={5}
                  />
                  <small className="admin-panel__field-hint">
                    {CATEGORY_TREE_ADMIN_PAGE_UI.DEFAULT_CHARACTERISTICS_HINT}
                  </small>
                </label>
              ) : null}
            </div>
            <div className="admin-panel__edit-actions">
              <button
                type="button"
                className="app-btn app-btn--primary"
                disabled={isPending}
                onClick={onSave}
              >
                {CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_BUTTON}
              </button>
              <button
                type="button"
                className="app-btn app-btn--cancel"
                onClick={onCancelEdit}
              >
                {CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON}
              </button>
            </div>
          </>
        ) : (
          <div className="admin-panel__tree-indent">
            <span className="admin-panel__tree-rail" aria-hidden />
            <div className="admin-panel__card-main">
              <div className="admin-panel__card-top">
                <div className="admin-panel__card-main">
                  <p className="admin-panel__path">{pathLabel}</p>
                  <span className="admin-panel__slug">{row.slug}</span>
                  <div className="admin-panel__meta">
                    <span
                      className={[
                        "admin-panel__chip",
                        row.isLeaf
                          ? "admin-panel__chip_leaf"
                          : "admin-panel__chip_branch",
                      ].join(" ")}
                    >
                      {row.isLeaf
                        ? CATEGORY_TREE_ADMIN_PAGE_UI.LEAF_BADGE
                        : CATEGORY_TREE_ADMIN_PAGE_UI.BRANCH_BADGE}
                    </span>
                    {row.legacyProductCategory ? (
                      <span className="admin-panel__chip">
                        {PRODUCT_CATEGORY_LABEL_RU[row.legacyProductCategory] ??
                          row.legacyProductCategory}
                      </span>
                    ) : null}
                  </div>
                  {keywords.length > 0 ? (
                    <p className="admin-panel__keywords">{keywords.join(" · ")}</p>
                  ) : null}
                  {row.isLeaf && defaultCharacteristicKeys.length > 0 ? (
                    <p className="admin-panel__keywords">
                      {CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_DEFAULT_CHARACTERISTICS}:{" "}
                      {defaultCharacteristicKeys.join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="admin-panel__card-actions">
                  <button
                    type="button"
                    className="app-btn app-btn--secondary"
                    onClick={onStartEdit}
                  >
                    {CATEGORY_TREE_ADMIN_PAGE_UI.EDIT_BUTTON}
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn--danger"
                    disabled={isPending}
                    onClick={onDelete}
                  >
                    {CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
});
