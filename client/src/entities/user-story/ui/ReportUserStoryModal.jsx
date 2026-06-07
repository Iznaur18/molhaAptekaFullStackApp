import { useState } from "react";

import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { PRODUCT_REPORT_TEXT_MAX_CHARS } from "../../product-report/model/constants.js";
import { useUserStoryMutations } from "../model/useUserStoryMutations.js";

import "./ReportUserStoryModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   storyId: string;
 *   onClose: () => void;
 * }} props
 */
export function ReportUserStoryModal({ isOpen, storyId, onClose }) {
  const { reportMutation } = useUserStoryMutations();
  const [reportText, setReportText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useScrollLock(isOpen);

  const handleClose = () => {
    setReportText("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    const text = reportText.trim();
    if (text.length === 0) {
      setError("Укажите текст жалобы");
      return;
    }

    setIsBusy(true);
    setError("");
    try {
      await reportMutation.mutateAsync({ storyId, body: { reportText: text } });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="report-user-story-modal__backdrop" role="presentation">
      <div
        className="report-user-story-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-user-story-title"
      >
        <h2 id="report-user-story-title" className="report-user-story-modal__title">
          {USER_STORY_UI.STORY_REPORT_TITLE}
        </h2>

        {success ? (
          <p className="report-user-story-modal__success">Жалоба принята</p>
        ) : (
          <>
            <label className="report-user-story-modal__label">
              {USER_STORY_UI.STORY_REPORT_TEXT_LABEL}
              <textarea
                className="report-user-story-modal__textarea"
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                placeholder={USER_STORY_UI.STORY_REPORT_TEXT_PLACEHOLDER}
                maxLength={PRODUCT_REPORT_TEXT_MAX_CHARS}
                rows={4}
                disabled={isBusy}
              />
            </label>
            {error ? (
              <p className="report-user-story-modal__error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="report-user-story-modal__actions">
              <button
                type="button"
                className="report-user-story-modal__button"
                disabled={isBusy}
                onClick={() => void handleSubmit()}
              >
                {isBusy
                  ? USER_STORY_UI.STORY_REPORT_PENDING
                  : USER_STORY_UI.STORY_REPORT_SUBMIT}
              </button>
              <button
                type="button"
                className="report-user-story-modal__button report-user-story-modal__button_secondary"
                disabled={isBusy}
                onClick={handleClose}
              >
                {USER_STORY_UI.CLOSE}
              </button>
            </div>
          </>
        )}

        {success ? (
          <button
            type="button"
            className="report-user-story-modal__button"
            onClick={handleClose}
          >
            {USER_STORY_UI.CLOSE}
          </button>
        ) : null}
      </div>
    </div>
  );
}
