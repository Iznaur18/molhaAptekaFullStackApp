import {
  formatPassportDate,
  formatPassportFullName,
} from "../../user-data-confirmation/lib/formatPassportDisplay.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import {
  PRIVATE_UPLOAD_LOAD_FAILED,
  usePrivateUploadDisplayUrl,
} from "../../../shared/lib/usePrivateUploadDisplayUrl.js";

import "./BuyerPassportSharePanel.css";

/**
 * @param {{
 *   share: {
 *     passport: import("../../user-data-confirmation/model/types.js").PassportSnapshot;
 *     passportSelfiePhotoUrl?: string;
 *   } | null | undefined;
 * }} props
 */
export function BuyerPassportSharePanel({ share }) {
  const selfiePhotoUrl = share?.passportSelfiePhotoUrl?.trim() ?? "";
  const selfieDisplayUrl = usePrivateUploadDisplayUrl(
    share?.passport ? selfiePhotoUrl : "",
  );

  if (!share?.passport) {
    return null;
  }

  const { passport } = share;

  return (
    <section className="buyer-passport-share-panel">
      <h4 className="buyer-passport-share-panel__title">
        {INSTALLMENT_UI.PASSPORT_SHARE_SECTION}
      </h4>
      <dl className="buyer-passport-share-panel__grid">
        <div>
          <dt>ФИО</dt>
          <dd>{formatPassportFullName(passport)}</dd>
        </div>
        <div>
          <dt>Дата рождения</dt>
          <dd>{formatPassportDate(passport.birthDate)}</dd>
        </div>
        <div>
          <dt>Серия и номер</dt>
          <dd>
            {passport.series} {passport.number}
          </dd>
        </div>
        <div>
          <dt>Кем выдан</dt>
          <dd>{passport.issuedBy}</dd>
        </div>
        <div>
          <dt>Дата выдачи</dt>
          <dd>{formatPassportDate(passport.issuedAt)}</dd>
        </div>
        <div>
          <dt>Код подразделения</dt>
          <dd>{passport.departmentCode}</dd>
        </div>
      </dl>
      <div className="buyer-passport-share-panel__selfie">
        <h5 className="buyer-passport-share-panel__selfie-title">
          {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}
        </h5>
        {selfieDisplayUrl && selfieDisplayUrl !== PRIVATE_UPLOAD_LOAD_FAILED ? (
          <a
            className="buyer-passport-share-panel__selfie-link"
            href={selfieDisplayUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="buyer-passport-share-panel__selfie-image"
              src={selfieDisplayUrl}
              alt={INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_SECTION}
            />
            <span>{INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_OPEN}</span>
          </a>
        ) : selfieDisplayUrl === PRIVATE_UPLOAD_LOAD_FAILED ? (
          <p className="buyer-passport-share-panel__selfie-missing">
            {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_LOAD_ERROR}
          </p>
        ) : selfiePhotoUrl ? (
          <p className="buyer-passport-share-panel__selfie-missing">Загрузка фото…</p>
        ) : (
          <p className="buyer-passport-share-panel__selfie-missing">
            {INSTALLMENT_UI.PASSPORT_SHARE_SELFIE_MISSING}
          </p>
        )}
      </div>
    </section>
  );
}
