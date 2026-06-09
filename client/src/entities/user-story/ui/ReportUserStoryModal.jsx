import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReportText("");
      setError("");
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  const isSubmitting = reportMutation.isPending;

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const text = reportText.trim();
    if (text.length === 0) {
      setError("Укажите текст жалобы");
      return;
    }

    setError("");
    try {
      await reportMutation.mutateAsync({ storyId, body: { reportText: text } });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="report-user-story-modal__backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="report-user-story-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-user-story-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="report-user-story-title" className="report-user-story-modal__title">
          {USER_STORY_UI.STORY_REPORT_TITLE}
        </h2>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <label className="report-user-story-modal__label">
            {USER_STORY_UI.STORY_REPORT_TEXT_LABEL}
            <textarea
              className="report-user-story-modal__textarea"
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              placeholder={USER_STORY_UI.STORY_REPORT_TEXT_PLACEHOLDER}
              maxLength={PRODUCT_REPORT_TEXT_MAX_CHARS}
              rows={4}
              disabled={isSubmitting}
            />
          </label>
          {error ? (
            <p className="report-user-story-modal__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="report-user-story-modal__actions">
            <button
              type="submit"
              className="report-user-story-modal__button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? USER_STORY_UI.STORY_REPORT_PENDING
                : USER_STORY_UI.STORY_REPORT_SUBMIT}
            </button>
            <button
              type="button"
              className="report-user-story-modal__button report-user-story-modal__button_secondary"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              {USER_STORY_UI.CLOSE}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
