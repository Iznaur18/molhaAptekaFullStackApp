import { useId } from "react";

import { useProductBulkImport } from "../model/useProductBulkImport.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductBulkImportModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onCompleted?: () => void;
 * }} props
 */
export function ProductBulkImportModal({ isOpen, onClose, onCompleted }) {
  const titleId = useId();
  const fileInputId = useId();
  const bulkImport = useProductBulkImport({ isOpen, onCompleted });

  if (!isOpen) {
    return null;
  }

  const progressValue =
    bulkImport.totalRows > 0
      ? Math.min(bulkImport.processedRows, bulkImport.totalRows)
      : 0;
  const progressMax = Math.max(bulkImport.totalRows, 1);

  const handleClose = () => {
    if (bulkImport.isBusy) {
      return;
    }
    onClose();
  };

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_TITLE}
      titleId={titleId}
      ariaLabel={CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_TITLE}
      size="md"
      panelClassName="product-bulk-import-modal__panel"
      bodyClassName="product-bulk-import-modal__body"
      footerClassName="product-bulk-import-modal__footer-wrap"
      footer={
        <div className="product-bulk-import-modal__footer">
          <button
            type="button"
            className="create-product-wizard__back"
            onClick={handleClose}
            disabled={bulkImport.isBusy}
          >
            {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_CLOSE}
          </button>
          {bulkImport.phase !== "completed" ? (
            <button
              type="button"
              className="create-product-wizard__primary"
              onClick={() => void bulkImport.handleSubmit()}
              disabled={bulkImport.isBusy || !bulkImport.selectedFile}
            >
              {bulkImport.phase === "validating"
                ? CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_SUBMIT_LOADING
                : CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_SUBMIT}
            </button>
          ) : null}
        </div>
      }
    >
      <p className="product-bulk-import-modal__hint">
        {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_HINT}
      </p>

      <div className="product-bulk-import-modal__actions">
        <button
          type="button"
          className="create-product-wizard__back"
          onClick={() => void bulkImport.handleDownloadTemplate()}
          disabled={bulkImport.isBusy}
        >
          {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_DOWNLOAD_TEMPLATE}
        </button>
        <label className="create-product-wizard__primary" htmlFor={fileInputId}>
          {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_PICK_FILE}
        </label>
        <input
          id={fileInputId}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label={CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_FILE_ARIA}
          hidden
          disabled={bulkImport.isBusy}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            bulkImport.handlePickFile(file);
          }}
        />
      </div>

      {bulkImport.selectedFile ? (
        <p className="product-bulk-import-modal__file-name">{bulkImport.selectedFile.name}</p>
      ) : null}

      {bulkImport.phase === "processing" ? (
        <div className="product-bulk-import-modal__progress" aria-live="polite">
          <progress
            className="product-bulk-import-modal__progress-bar"
            max={progressMax}
            value={progressValue}
          />
          <p className="product-bulk-import-modal__progress-label">
            {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_PROGRESS(
              bulkImport.processedRows,
              bulkImport.totalRows,
            )}
          </p>
        </div>
      ) : null}

      {bulkImport.phase === "completed" ? (
        <p className="product-bulk-import-modal__success" role="status">
          {CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_COMPLETED(bulkImport.createdCount)}
        </p>
      ) : null}

      {bulkImport.phase === "validation_failed" ? (
        <>
          <p className="product-bulk-import-modal__error" role="alert">
            {bulkImport.errorMessage || CREATE_PRODUCT_MODAL_UI.BULK_IMPORT_VALIDATION_TITLE}
          </p>
          {bulkImport.validationErrors.length > 0 ? (
            <ul className="product-bulk-import-modal__errors">
              {bulkImport.validationErrors.map((item) => (
                <li key={`${item.row}-${item.field}-${item.message}`}>
                  Строка {item.row}, {item.field}: {item.message}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      {bulkImport.phase === "failed" && bulkImport.errorMessage ? (
        <p className="product-bulk-import-modal__error" role="alert">
          {bulkImport.errorMessage}
        </p>
      ) : null}
    </ProductModalShell>
  );
}
