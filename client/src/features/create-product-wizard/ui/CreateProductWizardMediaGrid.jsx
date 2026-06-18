import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
function SortableMediaTile({
  row,
  index,
  isSelected,
  isCover,
  disabled = false,
  onSelect,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "create-product-wizard-media-grid__tile",
        isSelected ? "create-product-wizard-media-grid__tile_selected" : "",
        isDragging ? "create-product-wizard-media-grid__tile_dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="create-product-wizard-media-grid__drag"
        aria-label={CREATE_PRODUCT_MODAL_UI.DRAG_HANDLE_ARIA}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
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
 *   rowIds: string[];
 *   selectedIndex: number;
 *   canAddRow: boolean;
 *   maxRows: number;
 *   disabled?: boolean;
 *   sensors: import('@dnd-kit/core').SensorDescriptor<any>[];
 *   onDragEnd: import('@dnd-kit/core').DragEndEvent => void;
 *   onSelect: (index: number) => void;
 *   onAdd: () => void;
 *   filledCount: number;
 * }} props
 */
export function CreateProductWizardMediaGrid({
  rows,
  rowIds,
  selectedIndex,
  canAddRow,
  maxRows,
  disabled = false,
  sensors,
  onDragEnd,
  onSelect,
  onAdd,
  filledCount,
}) {
  return (
    <section className="create-product-wizard-media-grid" aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_GALLERY_LABEL}>
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rowIds} strategy={rectSortingStrategy}>
          <div className="create-product-wizard-media-grid__tiles">
            {rows.map((row, index) => (
              <SortableMediaTile
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
                <span>{CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_ADD_SLOT}</span>
              </button>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
