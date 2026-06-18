import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useProductImageUrlRows } from "../model/useProductImageUrlRows.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../lib/productFieldRegistry.js";
import {
  isDisplayableProductImageUrl,
  resolveImageUrlForDisplay,
} from "../../../shared/lib/resolveUploadedImageUrl.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./ProductImageUrlSortableList.css";

/**
 * @param {{
 *   row: import('../lib/productImageRowHelpers.js').ProductImageRow;
 *   index: number;
 *   canRemove: boolean;
 *   disabled?: boolean;
 *   onUrlChange: (id: string, url: string) => void;
 *   onRemove: (id: string) => void;
 * }} props
 */
function SortableImageRow({
  row,
  index,
  canRemove,
  disabled = false,
  onUrlChange,
  onRemove,
}) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const trimmed = row.url.trim();
  const displayUrl = resolveImageUrlForDisplay(trimmed);
  const showPreview =
    displayUrl !== "" && isDisplayableProductImageUrl(trimmed) && !previewFailed;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "product-image-sortable__row product-image-sortable__row_dragging"
          : "product-image-sortable__row"
      }
    >
      <button
        type="button"
        className="product-image-sortable__drag-handle"
        aria-label={CREATE_PRODUCT_MODAL_UI.DRAG_HANDLE_ARIA}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <span className="product-image-sortable__order" aria-hidden="true">
        {index + 1}
      </span>
      <div className="product-image-sortable__preview" aria-hidden={!showPreview}>
        {showPreview ? (
          <img
            src={displayUrl}
            alt=""
            decoding="async"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <span className="product-image-sortable__preview-placeholder">—</span>
        )}
      </div>
      <ImageUrlField
        compact
        value={row.url}
        onChange={(url) => {
          setPreviewFailed(false);
          onUrlChange(row.id, url);
        }}
        disabled={disabled}
        ariaLabel={`${CREATE_PRODUCT_MODAL_UI.IMAGE_ROW_ARIA_PREFIX} ${index + 1}`}
      />
      {canRemove ? (
        <button
          type="button"
          className="product-image-sortable__remove"
          onClick={() => onRemove(row.id)}
          aria-label={CREATE_PRODUCT_MODAL_UI.REMOVE_IMAGE_ROW_ARIA}
        >
          <ModalCloseIcon size="sm" />
        </button>
      ) : null}
    </li>
  );
}

/**
 * @param {{
 *   rows: import('../lib/productImageRowHelpers.js').ProductImageRow[];
 *   onRowsChange: (rows: import('../lib/productImageRowHelpers.js').ProductImageRow[]) => void;
 *   disabled?: boolean;
 * }} props
 */
export function ProductImageUrlSortableList({ rows, onRowsChange, disabled = false }) {
  const {
    sensors,
    rowIds,
    canAddRow,
    handleDragEnd,
    updateRowUrl,
    removeRow,
    addRow,
  } = useProductImageUrlRows(rows, onRowsChange);

  return (
    <fieldset className="product-image-sortable" disabled={disabled}>
      <legend className="product-image-sortable__legend">
        {getProductFieldEditLabel("productImageUrls")}
      </legend>
      <p className="product-image-sortable__hint">
        {CREATE_PRODUCT_MODAL_UI.IMAGE_ORDER_HINT}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          <ul className="product-image-sortable__list">
            {rows.map((row, index) => (
              <SortableImageRow
                key={row.id}
                row={row}
                index={index}
                canRemove={rows.length > 1}
                disabled={disabled}
                onUrlChange={updateRowUrl}
                onRemove={removeRow}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {canAddRow ? (
        <button type="button" className="product-image-sortable__add" onClick={addRow}>
          {CREATE_PRODUCT_MODAL_UI.ADD_IMAGE_ROW}
        </button>
      ) : null}
    </fieldset>
  );
}
