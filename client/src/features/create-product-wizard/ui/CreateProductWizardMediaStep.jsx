import { useCallback, useMemo, useState } from "react";

import {
  countFilledProductImageRows,
  resolveProductImageSelectionAfterRemove,
  resolveProductImageSelectionAfterReorder,
} from "../../../entities/product/lib/resolveProductImageCoverPreview.js";
import { useProductImageUrlRows } from "../../../entities/product/model/useProductImageUrlRows.js";
import { CreateProductWizardMediaCover } from "./CreateProductWizardMediaCover.jsx";
import { CreateProductWizardMediaEditor } from "./CreateProductWizardMediaEditor.jsx";
import { CreateProductWizardMediaGrid } from "./CreateProductWizardMediaGrid.jsx";
import { CreateProductWizardMediaVideoCard } from "./CreateProductWizardMediaVideoCard.jsx";

import "./CreateProductWizardMediaStep.css";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 * }} props
 */
export function CreateProductWizardMediaStep({ form, setForm, isSubmitting }) {
  const rows = /** @type {import('../../../entities/product/lib/productImageRowHelpers.js').ProductImageRow[]} */ (
    form.productImageRows
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onRowsChange = useCallback(
    (productImageRows) => {
      setForm((prev) => ({ ...prev, productImageRows }));
    },
    [setForm],
  );

  const imageRows = useProductImageUrlRows(rows, onRowsChange);
  const filledCount = useMemo(() => countFilledProductImageRows(rows), [rows]);
  const selectedRow = rows[selectedIndex] ?? rows[0];

  const handleDragEnd = useCallback(
    (event) => {
      const result = imageRows.handleDragEnd(event);
      if (!result) {
        return;
      }

      setSelectedIndex((current) =>
        resolveProductImageSelectionAfterReorder(result.oldIndex, result.newIndex, current),
      );
    },
    [imageRows],
  );

  const handleAdd = useCallback(() => {
    const newIndex = imageRows.addRow();
    if (newIndex >= 0) {
      setSelectedIndex(newIndex);
    }
  }, [imageRows]);

  const handleRemoveSelected = useCallback(() => {
    if (!selectedRow) {
      return;
    }

    const removeIndex = imageRows.removeRow(selectedRow.id);
    const nextLength = rows.length <= 1 ? 1 : rows.length - 1;
    setSelectedIndex((current) =>
      resolveProductImageSelectionAfterRemove(removeIndex, current, nextLength),
    );
  }, [imageRows, rows.length, selectedRow]);

  return (
    <div className="create-product-wizard-media-step">
      <CreateProductWizardMediaCover rows={rows} selectedIndex={selectedIndex} />
      <CreateProductWizardMediaGrid
        rows={rows}
        rowIds={imageRows.rowIds}
        selectedIndex={selectedIndex}
        canAddRow={imageRows.canAddRow}
        maxRows={imageRows.maxRows}
        disabled={isSubmitting}
        sensors={imageRows.sensors}
        onDragEnd={handleDragEnd}
        onSelect={setSelectedIndex}
        onAdd={handleAdd}
        filledCount={filledCount}
      />
      {selectedRow ? (
        <CreateProductWizardMediaEditor
          index={selectedIndex}
          isCover={selectedIndex === 0}
          url={selectedRow.url}
          canRemove={rows.length > 1 || Boolean(selectedRow.url.trim())}
          disabled={isSubmitting}
          onUrlChange={(url) => imageRows.updateRowUrl(selectedRow.id, url)}
          onRemove={handleRemoveSelected}
        />
      ) : null}
      <CreateProductWizardMediaVideoCard
        value={String(form.productPreviewVideoUrl ?? "")}
        onChange={(productPreviewVideoUrl) =>
          setForm((prev) => ({ ...prev, productPreviewVideoUrl }))
        }
        disabled={isSubmitting}
      />
    </div>
  );
}
