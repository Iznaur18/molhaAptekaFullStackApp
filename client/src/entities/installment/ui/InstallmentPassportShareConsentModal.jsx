import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentPassportShareConsentModal.css";

const TITLE_ID = "installment-passport-share-consent-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   isConfirming?: boolean;
 *   onClose: () => void;
 *   onConfirm: () => void;
 * }} props
 */
export function InstallmentPassportShareConsentModal({
  isOpen,
  isConfirming = false,
  onClose,
  onConfirm,
}) {
  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_TITLE}
      titleId={TITLE_ID}
      ariaLabel={INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_TITLE}
      size="md"
      panelClassName="installment-passport-share-consent"
      bodyClassName="installment-passport-share-consent__body"
      footer={
        <div className="installment-passport-share-consent__actions">
          <button
            type="button"
            className="installment-passport-share-consent__cancel"
            onClick={onClose}
            disabled={isConfirming}
          >
            {INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_CANCEL}
          </button>
          <button
            type="button"
            className="installment-passport-share-consent__confirm"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming
              ? INSTALLMENT_UI.SUBMITTING
              : INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_CONFIRM}
          </button>
        </div>
      }
    >
      <div className="installment-passport-share-consent__text">
        {INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_PARAGRAPHS.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </ProductModalShell>
  );
}
