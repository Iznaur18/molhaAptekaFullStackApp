import { useEffect, useRef, useState } from "react";

import { CourierDocumentThumb } from "../../../entities/courier/ui/CourierDocumentThumb.jsx";
import { uploadImage } from "../../../shared/api/index.js";
import { COURIER_UI } from "../../../shared/config/appUiCopy.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";

/** Все документы курьера едут в private uploads — сервер жмёт их сам. */
const COURIER_DOCUMENT_PURPOSE = "courier-document";

/**
 * Один обязательный снимок заявки.
 *
 * Превью показываем из локального файла, а не по сохранённой ссылке: пока
 * заявка не отправлена, private-файл ещё ни к кому не привязан, и сервер
 * такой запрос законно отклонит.
 *
 * @param {{
 *   label: string;
 *   value: string;
 *   disabled?: boolean;
 *   onChange: (url: string) => void;
 *   onError: (message: string) => void;
 * }} props
 */
export function CourierDocumentField({ label, value, disabled, onChange, onError }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handlePick = async (event) => {
    const file = event.target.files?.[0];
    // Инпут сбрасываем сразу: иначе повторный выбор того же файла молчит.
    event.target.value = "";
    if (!file) return;

    const fileError = validateUploadImageFile(file);
    if (fileError) {
      onError(fileError);
      return;
    }

    onError("");
    setIsUploading(true);
    try {
      const url = await uploadImage(file, COURIER_DOCUMENT_PURPOSE);
      onChange(url);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    } catch (e) {
      onError(e instanceof Error ? e.message : COURIER_UI.ERROR_GENERIC);
    } finally {
      setIsUploading(false);
    }
  };

  const hasFile = Boolean(value);

  return (
    <div className="courier-page__doc">
      <span className="courier-page__doc-label">{label}</span>

      {previewUrl ? (
        <img className="courier-page__doc-preview" src={previewUrl} alt={label} />
      ) : hasFile ? (
        <CourierDocumentThumb
          url={value}
          label={COURIER_UI.PHOTO_READY}
          failedLabel={COURIER_UI.PHOTO_READY}
        />
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="courier-page__doc-input"
        onChange={handlePick}
        disabled={disabled || isUploading}
      />
      <button
        type="button"
        className="courier-page__doc-button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        {isUploading
          ? COURIER_UI.PHOTO_UPLOADING
          : hasFile
            ? COURIER_UI.PHOTO_REPLACE
            : COURIER_UI.PHOTO_PICK}
      </button>
    </div>
  );
}
