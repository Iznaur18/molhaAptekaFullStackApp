import {
  PRIVATE_UPLOAD_LOAD_FAILED,
  usePrivateUploadDisplayUrl,
} from "../../../shared/lib/usePrivateUploadDisplayUrl.js";

import "./CourierDocumentThumb.css";

/**
 * Снимок из заявки курьера.
 *
 * Файл приватный: `<img src>` на него отвечает 401, картинку надо забрать
 * запросом с кукой — этим и занят хук.
 *
 * @param {{ url: string; label: string; failedLabel: string }} props
 */
export function CourierDocumentThumb({ url, label, failedLabel }) {
  const displayUrl = usePrivateUploadDisplayUrl(url);

  if (displayUrl === PRIVATE_UPLOAD_LOAD_FAILED) {
    return (
      <span className="courier-doc-thumb courier-doc-thumb_failed">{failedLabel}</span>
    );
  }

  return (
    <figure className="courier-doc-thumb">
      {displayUrl ? <img src={displayUrl} alt={label} /> : <span />}
      <figcaption>{label}</figcaption>
    </figure>
  );
}
