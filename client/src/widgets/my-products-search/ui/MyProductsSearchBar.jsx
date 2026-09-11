import { CATALOG_SEARCH_QUERY_MAX_LENGTH } from "@molha/api-contract";

import { MY_PRODUCTS_SEARCH_UI } from "../../../shared/config/appUiCopy.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import "./MyProductsSearchBar.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (next: string) => void;
 *   onSubmit: () => void;
 *   isPending?: boolean;
 * }} props
 */
export function MyProductsSearchBar({ value, onChange, onSubmit, isPending = false }) {
  return (
    <div className="my-products-search-bar">
      <SearchInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={MY_PRODUCTS_SEARCH_UI.PLACEHOLDER}
        ariaLabel={MY_PRODUCTS_SEARCH_UI.ARIA_LABEL}
        clearAriaLabel={MY_PRODUCTS_SEARCH_UI.CLEAR_ARIA}
        pendingAriaLabel={MY_PRODUCTS_SEARCH_UI.PENDING_ARIA}
        isPending={isPending}
        showLeadingIcon
        maxLength={CATALOG_SEARCH_QUERY_MAX_LENGTH}
      />
      <button
        type="button"
        className="app-btn app-btn--primary my-products-search-bar__submit"
        onClick={onSubmit}
      >
        {MY_PRODUCTS_SEARCH_UI.SUBMIT}
      </button>
    </div>
  );
}
