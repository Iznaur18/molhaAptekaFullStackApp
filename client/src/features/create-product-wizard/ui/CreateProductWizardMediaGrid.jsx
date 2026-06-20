import { useEffect, useRef } from "react";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { CreateProductWizardMediaTilePreview } from "./CreateProductWizardMediaCover.jsx";

import "./CreateProductWizardMediaGrid.css";

/**
 * @param {{
 *   row: import('../../../entities/product/lib/productImageRowHelpers.js').ProductImageRow;
 *   index: number;
 *   isSelected: boolean;
 *   isCover: boolean;
 *   disabled?: boolean;
 *   onSelect: (index: number) => void;
 * }} props
 */
function MediaTile({ row, index, isSelected, isCover, disabled = false, onSelect }) {
  return (
    <div
      className={[
        "create-product-wizard-media-grid__tile",
        isSelected ? "create-product-wizard-media-grid__tile_selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="create-product-wizard-media-grid__select"
        aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_SLOT_ARIA(index + 1)}
        aria-current={isSelected ? "true" : undefined}
        disabled={disabled}
        onClick={() => onSelect(index)}
      >
        {isCover ? (
          <span className="create-product-wizard-media-grid__cover-tag">
            {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_COVER_LABEL}
          </span>
        ) : null}
        <CreateProductWizardMediaTilePreview url={row.url} />
        <span className="create-product-wizard-media-grid__index">{index + 1}</span>
      </button>
    </div>
  );
}

/**
 * @param {{
 *   rows: import('../../../entities/product/lib/productImageRowHelpers.js').ProductImageRow[];
 *   selectedIndex: number;
 *   canAddRow: boolean;
 *   maxRows: number;
 *   disabled?: boolean;
 *   onSelect: (index: number) => void;
 *   onAdd: () => void;
 *   filledCount: number;
 * }} props
 */
export function CreateProductWizardMediaGrid({
  rows,
  selectedIndex,
  canAddRow,
  maxRows,
  disabled = false,
  onSelect,
  onAdd,
  filledCount,
}) {
  const trackRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const selectedTile = track.querySelector(
      ".create-product-wizard-media-grid__tile_selected",
    );
    selectedTile?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedIndex]);

  return (
    <section
      className="create-product-wizard-media-grid"
      aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_GALLERY_LABEL}
    >
      <div className="create-product-wizard-media-grid__head">
        <h4 className="create-product-wizard-media-grid__title">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_GALLERY_LABEL}
        </h4>
        <span className="create-product-wizard-media-grid__count">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_FILLED_COUNT(filledCount, maxRows)}
        </span>
      </div>
      <p className="create-product-wizard-media-grid__hint">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_GALLERY_HINT}
      </p>
      <div ref={trackRef} className="create-product-wizard-media-grid__track">
        {rows.map((row, index) => (
          <MediaTile
            key={row.id}
            row={row}
            index={index}
            isSelected={selectedIndex === index}
            isCover={index === 0}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
        {canAddRow ? (
          <button
            type="button"
            className="create-product-wizard-media-grid__add"
            onClick={onAdd}
            disabled={disabled}
          >
            <span className="create-product-wizard-media-grid__add-icon" aria-hidden="true">
              +
            </span>
            <span className="create-product-wizard-media-grid__add-label">
              {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_ADD_SLOT}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
