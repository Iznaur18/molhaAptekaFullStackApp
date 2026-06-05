import { memo } from "react";

import { PRODUCT_CATEGORY_LABEL_RU } from "../../../entities/product/model/productConstants.js";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { SynonymCategoryPicker } from "./SynonymCategoryPicker.jsx";

/**
 * @param {{
 *   row: import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow;
 *   isEditing: boolean;
 *   isPending: boolean;
 *   editToken: string;
 *   editCategories: string[];
 *   onEditTokenChange: (value: string) => void;
 *   onEditCategoriesChange: (value: string[]) => void;
 *   onStartEdit: () => void;
 *   onCancelEdit: () => void;
 *   onSave: () => void;
 *   onDelete: () => void;
 * }} props
 */
export const SearchSynonymAdminCard = memo(function SearchSynonymAdminCard({
  row,
  isEditing,
  isPending,
  editToken,
  editCategories,
  onEditTokenChange,
  onEditCategoriesChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) {
  return (
    <li
      className={["admin-panel__card", isEditing ? "admin-panel__card_editing" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="admin-panel__card-body">
        {isEditing ? (
          <>
            <label className="admin-panel__field">
              <span>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_TOKEN}</span>
              <input
                value={editToken}
                onChange={(e) => onEditTokenChange(e.target.value)}
                minLength={3}
              />
            </label>
            <div className="admin-panel__field">
              <span>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_CATEGORIES}</span>
              <SynonymCategoryPicker
                selected={editCategories}
                onChange={onEditCategoriesChange}
                disabled={isPending}
              />
            </div>
            <div className="admin-panel__edit-actions">
              <button
                type="button"
                className="app-btn app-btn--primary"
                disabled={isPending || editCategories.length === 0}
                onClick={onSave}
              >
                {SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_BUTTON}
              </button>
              <button
                type="button"
                className="app-btn app-btn--secondary"
                onClick={onCancelEdit}
              >
                {SEARCH_SYNONYMS_ADMIN_PAGE_UI.CANCEL_BUTTON}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="admin-panel__card-top">
              <div className="admin-panel__card-main">
                <span className="admin-panel__token">{row.token}</span>
                <div className="admin-panel__meta">
                  {row.categories.map((slug) => (
                    <span
                      key={slug}
                      className="admin-panel__chip admin-panel__chip_accent"
                    >
                      {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
                    </span>
                  ))}
                </div>
              </div>
              <div className="admin-panel__card-actions">
                <button
                  type="button"
                  className="app-btn app-btn--secondary"
                  onClick={onStartEdit}
                >
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EDIT_BUTTON}
                </button>
                <button
                  type="button"
                  className="app-btn app-btn--danger"
                  disabled={isPending}
                  onClick={onDelete}
                >
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_BUTTON}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </li>
  );
});
