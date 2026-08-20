import { useEffect, useState } from "react";

import {
  fetchStaffBroadcastRecipientsCount,
  postStaffBroadcastNotification,
} from "../../../entities/staff-broadcast/api/staffBroadcastApi.js";
import { STAFF_BROADCAST_NOTIFICATIONS_ADMIN_PAGE_UI as UI } from "../../../shared/config/appUiCopy.js";

import "./StaffBroadcastNotificationsAdminPage.css";

export function StaffBroadcastNotificationsAdminPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientsCount, setRecipientsCount] = useState(/** @type {number | null} */ (null));
  const [countError, setCountError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isCounting, setIsCounting] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsCounting(true);
    setCountError("");
    void fetchStaffBroadcastRecipientsCount()
      .then((count) => {
        if (!cancelled) {
          setRecipientsCount(count);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCountError(error instanceof Error ? error.message : UI.COUNT_ERROR);
          setRecipientsCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCounting(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccessText("");

    const nextTitle = title.trim();
    const nextMessage = message.trim();
    if (!nextTitle || !nextMessage) {
      setSubmitError(UI.VALIDATION_REQUIRED);
      return;
    }

    const count = recipientsCount ?? 0;
    const confirmed = window.confirm(UI.CONFIRM(count));
    if (!confirmed) {
      return;
    }

    setIsSending(true);
    try {
      const result = await postStaffBroadcastNotification({
        title: nextTitle,
        message: nextMessage,
      });
      setSuccessText(UI.SUCCESS(result.sent));
      setTitle("");
      setMessage("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : UI.SEND_ERROR);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="staff-broadcast-page">
      <header className="staff-broadcast-page__header">
        <h2 className="staff-broadcast-page__title">{UI.TITLE}</h2>
        <p className="staff-broadcast-page__hint">{UI.HINT}</p>
      </header>

      <p className="staff-broadcast-page__count" aria-live="polite">
        {isCounting
          ? UI.COUNT_LOADING
          : countError
            ? countError
            : UI.COUNT(recipientsCount ?? 0)}
      </p>

      <form className="staff-broadcast-page__form" onSubmit={handleSubmit}>
        <label className="staff-broadcast-page__field">
          <span className="staff-broadcast-page__label">{UI.TITLE_LABEL}</span>
          <input
            type="text"
            className="staff-broadcast-page__input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            placeholder={UI.TITLE_PLACEHOLDER}
            disabled={isSending}
            required
          />
        </label>

        <label className="staff-broadcast-page__field">
          <span className="staff-broadcast-page__label">{UI.MESSAGE_LABEL}</span>
          <textarea
            className="staff-broadcast-page__textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={400}
            rows={5}
            placeholder={UI.MESSAGE_PLACEHOLDER}
            disabled={isSending}
            required
          />
        </label>

        {submitError ? (
          <p className="staff-broadcast-page__alert staff-broadcast-page__alert--error" role="alert">
            {submitError}
          </p>
        ) : null}
        {successText ? (
          <p className="staff-broadcast-page__alert staff-broadcast-page__alert--ok" role="status">
            {successText}
          </p>
        ) : null}

        <button
          type="submit"
          className="staff-broadcast-page__submit"
          disabled={isSending || isCounting || Boolean(countError)}
        >
          {isSending ? UI.SENDING : UI.SEND}
        </button>
      </form>
    </section>
  );
}
