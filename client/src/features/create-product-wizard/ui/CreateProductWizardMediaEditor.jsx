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
 *   canMoveEarlier?: boolean;
 *   canMoveLater?: boolean;
 *   disabled?: boolean;
 *   onUrlChange: (url: string) => void;
 *   onRemove: () => void;
 *   onMoveEarlier?: () => void;
 *   onMoveLater?: () => void;
 * }} props
 */
export function CreateProductWizardMediaEditor({
  index,
  isCover,
  url,
  canRemove,
  canMoveEarlier = false,
  canMoveLater = false,
  disabled = false,
  onUrlChange,
  onRemove,
  onMoveEarlier,
  onMoveLater,
}) {
  const showReorder = canMoveEarlier || canMoveLater;

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
      {showReorder ? (
        <div className="create-product-wizard-media-editor__reorder">
          <button
            type="button"
            className="create-product-wizard-media-editor__move"
            disabled={disabled || !canMoveEarlier}
            aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_MOVE_EARLIER_ARIA}
            onClick={onMoveEarlier}
          >
            ← {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_MOVE_EARLIER}
          </button>
          <button
            type="button"
            className="create-product-wizard-media-editor__move"
            disabled={disabled || !canMoveLater}
            aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_MOVE_LATER_ARIA}
            onClick={onMoveLater}
          >
            {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_MOVE_LATER} →
          </button>
        </div>
      ) : null}
      <ImageUrlField
        value={url}
        onChange={onUrlChange}
        disabled={disabled}
        ariaLabel={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_SLOT_ARIA(index + 1)}
      />
    </section>
  );
}
