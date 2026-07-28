import {
  createProductReturnTermRow,
  PRODUCT_RETURN_TERM_KEY_MAX,
  PRODUCT_RETURN_TERM_VALUE_MAX,
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
} from "../../lib/productReturnTermRows.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

import "../ProductCharacteristicsEditor.css";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 *   className?: string;
 * }} props
 */
export function CreateProductReturnsSection({
  form,
  setForm,
  isSubmitting,
  className = "",
}) {
  const yesSelected = form.productReturnEnabled === true;
  const noSelected = form.productReturnEnabled === false;
  const returnTermRows = Array.isArray(form.returnTermRows) ? form.returnTermRows : [];
  const canAddMore = returnTermRows.length < PRODUCT_RETURN_TERMS_MAX_ITEMS;

  const handleEnableYes = () => {
    setForm((prev) => {
      const prevRows = Array.isArray(prev.returnTermRows) ? prev.returnTermRows : [];
      return {
        ...prev,
        productReturnEnabled: true,
        returnTermRows: prevRows.length > 0 ? prevRows : [createProductReturnTermRow()],
      };
    });
  };

  const handleEnableNo = () => {
    setForm((prev) => ({
      ...prev,
      productReturnEnabled: false,
      returnTermRows: [],
    }));
  };

  const handleAddRow = () => {
    if (!canAddMore || isSubmitting) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      returnTermRows: [
        ...(Array.isArray(prev.returnTermRows) ? prev.returnTermRows : []),
        createProductReturnTermRow(),
      ],
    }));
  };

  const handleRemoveRow = (rowId) => {
    setForm((prev) => ({
      ...prev,
      returnTermRows: (Array.isArray(prev.returnTermRows) ? prev.returnTermRows : []).filter(
        (row) => row.id !== rowId,
      ),
    }));
  };

  const handleFieldChange = (rowId, field, nextValue) => {
    setForm((prev) => ({
      ...prev,
      returnTermRows: (Array.isArray(prev.returnTermRows) ? prev.returnTermRows : []).map((row) =>
        row.id === rowId ? { ...row, [field]: nextValue } : row,
      ),
    }));
  };

  return (
    <div className={["create-product-section", className].filter(Boolean).join(" ")}>
      <fieldset className="create-product-section__listing-origin" disabled={isSubmitting}>
        <legend className="create-product-section__listing-origin-legend">
          <FormFieldLabel required>{CREATE_PRODUCT_MODAL_UI.LABEL_RETURN_ENABLED}</FormFieldLabel>
        </legend>
        <p className="create-product-section__hint">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_RETURNS_SUBTITLE}
        </p>
        <div
          className="create-product-section__originality-chips"
          role="radiogroup"
          aria-label={CREATE_PRODUCT_MODAL_UI.LABEL_RETURN_ENABLED}
        >
          <button
            type="button"
            className={[
              "create-product-section__listing-origin-chip",
              yesSelected ? "create-product-section__listing-origin-chip_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={yesSelected}
            disabled={isSubmitting}
            onClick={handleEnableYes}
          >
            {CREATE_PRODUCT_MODAL_UI.RETURN_YES}
          </button>
          <button
            type="button"
            className={[
              "create-product-section__listing-origin-chip",
              noSelected ? "create-product-section__listing-origin-chip_active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={noSelected}
            disabled={isSubmitting}
            onClick={handleEnableNo}
          >
            {CREATE_PRODUCT_MODAL_UI.RETURN_NO}
          </button>
        </div>
      </fieldset>

      {yesSelected ? (
        <fieldset
          className="product-characteristics-editor create-product-returns__terms"
          disabled={isSubmitting}
          aria-label={CREATE_PRODUCT_MODAL_UI.RETURN_TERMS_SECTION_ARIA}
        >
          <p className="product-characteristics-editor__hint">
            {CREATE_PRODUCT_MODAL_UI.HINT_RETURN_TERMS}
          </p>
          {returnTermRows.length > 0 ? (
            <ul className="product-characteristics-editor__list">
              {returnTermRows.map((row, index) => (
                <li
                  key={row.id}
                  className="product-characteristics-editor__row"
                  aria-label={CREATE_PRODUCT_MODAL_UI.RETURN_TERM_ROW_ARIA(index + 1)}
                >
                  <input
                    className="create-product-section__input product-characteristics-editor__input"
                    type="text"
                    value={row.key}
                    onChange={(event) => handleFieldChange(row.id, "key", event.target.value)}
                    placeholder={CREATE_PRODUCT_MODAL_UI.PLACEHOLDER_RETURN_TERM_KEY}
                    maxLength={PRODUCT_RETURN_TERM_KEY_MAX}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <input
                    className="create-product-section__input product-characteristics-editor__input"
                    type="text"
                    value={row.value}
                    onChange={(event) => handleFieldChange(row.id, "value", event.target.value)}
                    placeholder={CREATE_PRODUCT_MODAL_UI.PLACEHOLDER_RETURN_TERM_VALUE}
                    maxLength={PRODUCT_RETURN_TERM_VALUE_MAX}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="product-characteristics-editor__remove"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={isSubmitting}
                    aria-label={CREATE_PRODUCT_MODAL_UI.REMOVE_RETURN_TERM_ROW_ARIA(index + 1)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            className="product-characteristics-editor__add"
            onClick={handleAddRow}
            disabled={isSubmitting || !canAddMore}
          >
            {CREATE_PRODUCT_MODAL_UI.ADD_RETURN_TERM_ROW}
          </button>
        </fieldset>
      ) : null}
    </div>
  );
}
