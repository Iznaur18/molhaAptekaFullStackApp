import { createCharacteristicRow } from "../lib/createCharacteristicRow.js";
import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "../model/productCharacteristicsConstants.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCharacteristicsEditor.css";

/**
 * @param {{
 *   rows: { id: string; key: string; value: string }[];
 *   onRowsChange: (rows: { id: string; key: string; value: string }[]) => void;
 *   disabled?: boolean;
 * }} props
 */
export function ProductCharacteristicsEditor({ rows, onRowsChange, disabled }) {
  const canAddMore = rows.length < PRODUCT_CHARACTERISTICS_MAX_ITEMS;

  const handleFieldChange = (rowId, field, nextValue) => {
    onRowsChange(
      rows.map((row) =>
        row.id === rowId ? { ...row, [field]: nextValue } : row,
      ),
    );
  };

  const handleRemoveRow = (rowId) => {
    onRowsChange(rows.filter((row) => row.id !== rowId));
  };

  const handleAddRow = () => {
    if (!canAddMore || disabled) {
      return;
    }

    onRowsChange([
      ...rows,
      createCharacteristicRow(),
    ]);
  };

  return (
    <fieldset
      className="product-characteristics-editor"
      disabled={disabled}
      aria-label={CREATE_PRODUCT_MODAL_UI.CHARACTERISTICS_SECTION_ARIA}
    >
      <legend className="product-characteristics-editor__legend">
        {CREATE_PRODUCT_MODAL_UI.LABEL_CHARACTERISTICS}
      </legend>
      <p className="product-characteristics-editor__hint">
        {CREATE_PRODUCT_MODAL_UI.HINT_CHARACTERISTICS(
          PRODUCT_CHARACTERISTICS_MAX_ITEMS,
        )}
      </p>
      {rows.length > 0 ? (
        <ul className="product-characteristics-editor__list">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="product-characteristics-editor__row"
              aria-label={CREATE_PRODUCT_MODAL_UI.CHARACTERISTIC_ROW_ARIA(
                index + 1,
              )}
            >
              <input
                className="product-characteristics-editor__input"
                type="text"
                value={row.key}
                onChange={(event) =>
                  handleFieldChange(row.id, "key", event.target.value)
                }
                placeholder={CREATE_PRODUCT_MODAL_UI.PLACEHOLDER_CHARACTERISTIC_KEY}
                maxLength={PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS}
                disabled={disabled}
                autoComplete="off"
              />
              <input
                className="product-characteristics-editor__input"
                type="text"
                value={row.value}
                onChange={(event) =>
                  handleFieldChange(row.id, "value", event.target.value)
                }
                placeholder={CREATE_PRODUCT_MODAL_UI.PLACEHOLDER_CHARACTERISTIC_VALUE}
                maxLength={PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS}
                disabled={disabled}
                autoComplete="off"
              />
              <button
                type="button"
                className="product-characteristics-editor__remove"
                onClick={() => handleRemoveRow(row.id)}
                disabled={disabled}
                aria-label={CREATE_PRODUCT_MODAL_UI.REMOVE_CHARACTERISTIC_ROW_ARIA(
                  index + 1,
                )}
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
        disabled={disabled || !canAddMore}
      >
        {CREATE_PRODUCT_MODAL_UI.ADD_CHARACTERISTIC_ROW}
      </button>
    </fieldset>
  );
}
