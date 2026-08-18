import { VideoUrlField } from "../../../shared/ui/VideoUrlField/VideoUrlField.jsx";
import { PRODUCT_PREVIEW_VIDEO_UI } from "../../../shared/config/appUiCopy.js";
import { validateProductPreviewVideoFile } from "../lib/validateProductPreviewVideoFile.js";

import "./ProductPreviewVideoField.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function ProductPreviewVideoField({ value, onChange, disabled = false }) {
  const trimmed = value.trim();

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="product-preview-video-field">
      <VideoUrlField
        value={value}
        onChange={onChange}
        disabled={disabled}
        validateFile={validateProductPreviewVideoFile}
        purpose="product-preview"
      />
      <p className="product-preview-video-field__hint">
        {PRODUCT_PREVIEW_VIDEO_UI.HINT}
      </p>
      {trimmed !== "" ? (
        <button
          type="button"
          className="product-preview-video-field__clear"
          onClick={handleClear}
          disabled={disabled}
        >
          {PRODUCT_PREVIEW_VIDEO_UI.CLEAR_BUTTON}
        </button>
      ) : null}
    </div>
  );
}
