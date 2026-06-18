import { useState } from "react";

import {
  resolveProductImageCoverPreview,
  resolveProductImagePreviewMeta,
} from "../../../entities/product/lib/resolveProductImageCoverPreview.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductWizardMediaCover.css";

/**
 * @param {{
 *   rows: import('../../../entities/product/lib/productImageRowHelpers.js').ProductImageRow[];
 *   selectedIndex: number;
 * }} props
 */
export function CreateProductWizardMediaCover({ rows, selectedIndex }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const cover = resolveProductImageCoverPreview(rows, selectedIndex);
  const showPreview = cover.canPreview && !previewFailed;

  return (
    <div className="create-product-wizard-media-cover">
      <div className="create-product-wizard-media-cover__frame">
        {showPreview ? (
          <img
            className="create-product-wizard-media-cover__image"
            src={cover.displayUrl}
            alt=""
            decoding="async"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <div className="create-product-wizard-media-cover__empty">
            <span className="create-product-wizard-media-cover__empty-icon" aria-hidden="true">
              📷
            </span>
            <p className="create-product-wizard-media-cover__empty-text">
              {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_COVER_EMPTY}
            </p>
          </div>
        )}
        <span className="create-product-wizard-media-cover__badge">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_COVER_LABEL}
        </span>
      </div>
    </div>
  );
}

/**
 * @param {{ url: string }} props
 */
export function CreateProductWizardMediaTilePreview({ url }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const preview = resolveProductImagePreviewMeta(url);
  const showPreview = preview.canPreview && !previewFailed;

  if (!showPreview) {
    return (
      <span className="create-product-wizard-media-grid__tile-empty">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_SLOT_EMPTY}
      </span>
    );
  }

  return (
    <img
      className="create-product-wizard-media-grid__tile-image"
      src={preview.displayUrl}
      alt=""
      decoding="async"
      onError={() => setPreviewFailed(true)}
    />
  );
}
