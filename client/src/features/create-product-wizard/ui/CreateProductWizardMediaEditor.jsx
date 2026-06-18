import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./CreateProductWizardMediaEditor.css";

/**
 * @param {{
 *   index: number;
 *   isCover: boolean;
 *   url: string;
 *   canRemove: boolean;
 *   disabled?: boolean;
 *   onUrlChange: (url: string) => void;
 *   onRemove: () => void;
 * }} props
 */
export function CreateProductWizardMediaEditor({
  index,
  isCover,
  url,
  canRemove,
  disabled = false,
  onUrlChange,
  onRemove,
}) {
  return (
    <section className="create-product-wizard-media-editor" aria-live="polite">
      <div className="create-product-wizard-media-editor__head">
        <h4 className="create-product-wizard-media-editor__title">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_EDITOR_LABEL(index + 1, isCover)}
        </h4>
        {canRemove ? (
          <button
            type="button"
            className="create-product-wizard-media-editor__remove"
            onClick={onRemove}
            disabled={disabled}
          >
            <ModalCloseIcon size="sm" />
            <span>{CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_REMOVE}</span>
          </button>
        ) : null}
      </div>
      <ImageUrlField
        value={url}
        onChange={onUrlChange}
        disabled={disabled}
        ariaLabel={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_SLOT_ARIA(index + 1)}
      />
    </section>
  );
}
