import { useState } from "react";

import { ProductPreviewVideoField } from "../../../entities/product/ui/ProductPreviewVideoField.jsx";
import { CREATE_PRODUCT_MODAL_UI, PRODUCT_PREVIEW_VIDEO_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductWizardMediaVideoCard.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductWizardMediaVideoCard({ value, onChange, disabled = false }) {
  const hasVideo = String(value ?? "").trim().length > 0;
  const [isOpen, setIsOpen] = useState(hasVideo);

  return (
    <section className="create-product-wizard-media-video">
      <div className="create-product-wizard-media-video__head">
        <div className="create-product-wizard-media-video__titles">
          <h4 className="create-product-wizard-media-video__title">
            {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_TITLE}
          </h4>
          <span className="create-product-wizard-media-video__badge">
            {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_OPTIONAL}
          </span>
        </div>
        <button
          type="button"
          className="create-product-wizard-media-video__toggle"
          onClick={() => setIsOpen((open) => !open)}
          disabled={disabled}
          aria-expanded={isOpen}
        >
          {isOpen
            ? CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_TOGGLE_CLOSE
            : CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_TOGGLE_OPEN}
        </button>
      </div>
      {isOpen ? (
        <div className="create-product-wizard-media-video__body">
          <p className="create-product-wizard-media-video__lead">
            {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_LEAD}
          </p>
          <p className="create-product-wizard-media-video__field-label">
            {PRODUCT_PREVIEW_VIDEO_UI.LABEL}
          </p>
          <ProductPreviewVideoField value={value} onChange={onChange} disabled={disabled} />
        </div>
      ) : null}
    </section>
  );
}
