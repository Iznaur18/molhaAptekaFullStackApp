import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { createImageRow } from "../lib/productImageRowHelpers.js";
import { PRODUCT_IMAGE_URLS_MAX } from "../model/productConstants.js";
import {
  COMMON_UI,
  CREATE_PRODUCT_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductImageUrlSortableList.css";

/**
 * @param {{
 *   row: import('../lib/productImageRowHelpers.js').ProductImageRow;
 *   index: number;
 *   canRemove: boolean;
 *   onUrlChange: (id: string, url: string) => void;
 *   onRemove: (id: string) => void;
 * }} props
 */
function SortableImageRow({ row, index, canRemove, onUrlChange, onRemove }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const trimmed = row.url.trim();
  const showPreview =
    trimmed !== "" && /^https?:\/\//i.test(trimmed) && !previewFailed;

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
            src={trimmed}
            alt=""
            decoding="async"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <span className="product-image-sortable__preview-placeholder">—</span>
        )}
      </div>
      <input
        className="product-image-sortable__input"
        type="url"
        value={row.url}
        onChange={(event) => {
          setPreviewFailed(false);
          onUrlChange(row.id, event.target.value);
        }}
        placeholder="https://"
        autoComplete="off"
        aria-label={`${CREATE_PRODUCT_MODAL_UI.IMAGE_ROW_ARIA_PREFIX} ${index + 1}`}
      />
      {canRemove ? (
        <button
          type="button"
          className="product-image-sortable__remove"
          onClick={() => onRemove(row.id)}
          aria-label={CREATE_PRODUCT_MODAL_UI.REMOVE_IMAGE_ROW_ARIA}
        >
          {COMMON_UI.MODAL_CLOSE_GLYPH}
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
export function ProductImageUrlSortableList({
  rows,
  onRowsChange,
  disabled = false,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row.id === active.id);
    const newIndex = rows.findIndex((row) => row.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onRowsChange(arrayMove(rows, oldIndex, newIndex));
  };

  const handleUrlChange = (id, url) => {
    onRowsChange(
      rows.map((row) => (row.id === id ? { ...row, url } : row)),
    );
  };

  const handleRemove = (id) => {
    if (rows.length <= 1) {
      onRowsChange([createImageRow("")]);
      return;
    }
    onRowsChange(rows.filter((row) => row.id !== id));
  };

  const handleAdd = () => {
    if (rows.length >= PRODUCT_IMAGE_URLS_MAX) return;
    onRowsChange([...rows, createImageRow("")]);
  };

  const rowIds = rows.map((row) => row.id);

  return (
    <fieldset
      className="product-image-sortable"
      disabled={disabled}
    >
      <legend className="product-image-sortable__legend">
        {CREATE_PRODUCT_MODAL_UI.LABEL_IMAGE_URLS}
      </legend>
      <p className="product-image-sortable__hint">
        {CREATE_PRODUCT_MODAL_UI.IMAGE_ORDER_HINT}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          <ul className="product-image-sortable__list">
            {rows.map((row, index) => (
              <SortableImageRow
                key={row.id}
                row={row}
                index={index}
                canRemove={rows.length > 1}
                onUrlChange={handleUrlChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {rows.length < PRODUCT_IMAGE_URLS_MAX ? (
        <button
          type="button"
          className="product-image-sortable__add"
          onClick={handleAdd}
        >
          {CREATE_PRODUCT_MODAL_UI.ADD_IMAGE_ROW}
        </button>
      ) : null}
    </fieldset>
  );
}
