import { memo } from "react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../../entities/product/model/productConstants.js";

/**
 * @param {{
 *   selected: string[];
 *   onChange: (next: string[]) => void;
 *   disabled?: boolean;
 * }} props
 */
export const SynonymCategoryPicker = memo(function SynonymCategoryPicker({
  selected,
  onChange,
  disabled = false,
}) {
  const toggleSlug = (slug) => {
    if (disabled) return;
    if (selected.includes(slug)) {
      onChange(selected.filter((item) => item !== slug));
      return;
    }
    onChange([...selected, slug]);
  };

  return (
    <div className="admin-panel__category-chips" role="group">
      {PRODUCT_CATEGORIES.map((slug) => {
        const isSelected = selected.includes(slug);
        return (
          <button
            key={slug}
            type="button"
            className={[
              "admin-panel__category-chip-btn",
              isSelected ? "admin-panel__category-chip-btn_selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => toggleSlug(slug)}
          >
            {PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug}
          </button>
        );
      })}
    </div>
  );
});
