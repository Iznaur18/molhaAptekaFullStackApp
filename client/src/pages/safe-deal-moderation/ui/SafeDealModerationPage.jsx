import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { SELLER_LEGAL_FORM_LABELS_RU } from "@molha/api-contract";

import {
  useReviewSafeDealApplicationMutation,
  useSafeDealApplicationsQuery,
} from "../../../entities/seller-safe-deal/model/sellerSafeDealQueries.js";
import {
  SAFE_DEAL_MODERATION_UI,
  SAFE_DEAL_REGISTRY_CHECK_URL,
} from "../../../shared/config/appUiCopy.js";

import "./SafeDealModerationPage.css";

const TABS = [
  { status: "pending", label: SAFE_DEAL_MODERATION_UI.TAB_PENDING },
  { status: "approved", label: SAFE_DEAL_MODERATION_UI.TAB_APPROVED },
  { status: "rejected", label: SAFE_DEAL_MODERATION_UI.TAB_REJECTED },
];

/** @param {string | null | undefined} value */
function formatSubmittedAt(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU");
}

/**
 * Очередь заявок на безопасную сделку.
 *
 * Работа модератора здесь одна: открыть ЕГРЮЛ и сверить, что ИНН принадлежит
 * заявленной форме и тому же человеку. Поэтому ИНН стоит крупно и рядом с
 * кнопкой копирования, а не прячется в мелком тексте карточки.
 *
 * @param {{ onQueueChanged?: () => void; onApplicantClick?: (userId: string) => void }} props
 */
export function SafeDealModerationPage({ onQueueChanged, onApplicantClick }) {
  const [status, setStatus] = useState("pending");
  const [comments, setComments] = useState(/** @type {Record<string, string>} */ ({}));
  const [rowError, setRowError] = useState(/** @type {Record<string, string>} */ ({}));
  const [pendingUserId, setPendingUserId] = useState(/** @type {string | null} */ (null));
  const [copiedUserId, setCopiedUserId] = useState(/** @type {string | null} */ (null));

  const queueQuery = useSafeDealApplicationsQuery({ status });
  const reviewMutation = useReviewSafeDealApplicationMutation();

  const applications = queueQuery.data?.applications ?? [];

  /** @param {string} userId @param {string} inn */
  const handleCopyInn = async (userId, inn) => {
    try {
      await navigator.clipboard.writeText(inn);
      setCopiedUserId(userId);
    } catch {
      // Буфер недоступен (нет разрешения или http) — ИНН всё равно можно выделить.
      setCopiedUserId(null);
    }
  };

  /** @param {string} userId @param {"approved" | "rejected"} nextStatus */
  const handleReview = async (userId, nextStatus) => {
    const comment = (comments[userId] ?? "").trim();
    if (nextStatus === "rejected" && !comment) {
      setRowError((prev) => ({
        ...prev,
        [userId]: SAFE_DEAL_MODERATION_UI.REASON_REQUIRED,
      }));
      return;
    }

    setPendingUserId(userId);
    setRowError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await reviewMutation.mutateAsync({ userId, nextStatus, comment });
      onQueueChanged?.();
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [userId]:
          e instanceof Error ? e.message : SAFE_DEAL_MODERATION_UI.ERROR_GENERIC,
      }));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="safe-deal-moderation">
      <header className="safe-deal-moderation__header">
        <h2 className="safe-deal-moderation__title">{SAFE_DEAL_MODERATION_UI.TITLE}</h2>
        <div className="safe-deal-moderation__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={status === tab.status}
              className="safe-deal-moderation__tab"
              onClick={() => setStatus(tab.status)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <p className="safe-deal-moderation__hint">{SAFE_DEAL_MODERATION_UI.HINT}</p>

      {queueQuery.isPending ? (
        <p className="safe-deal-moderation__loading">{SAFE_DEAL_MODERATION_UI.LOADING}</p>
      ) : queueQuery.isError ? (
        <p className="safe-deal-moderation__error" role="alert">
          {queueQuery.error instanceof Error
            ? queueQuery.error.message
            : SAFE_DEAL_MODERATION_UI.ERROR_GENERIC}
        </p>
      ) : applications.length === 0 ? (
        <p className="safe-deal-moderation__empty">{SAFE_DEAL_MODERATION_UI.EMPTY}</p>
      ) : (
        <ul className="safe-deal-moderation__list" role="list">
          {applications.map((row) => {
            const isRowPending = pendingUserId === row.userId;
            return (
              <li key={row.userId} className="safe-deal-moderation__card">
                <div className="safe-deal-moderation__who">
                  {onApplicantClick ? (
                    <button
                      type="button"
                      className="safe-deal-moderation__name-link"
                      onClick={() => onApplicantClick(row.userId)}
                    >
                      {row.userName || SAFE_DEAL_MODERATION_UI.NO_NAME}
                    </button>
                  ) : (
                    <span className="safe-deal-moderation__name">
                      {row.userName || SAFE_DEAL_MODERATION_UI.NO_NAME}
                    </span>
                  )}
                  {row.userPhoneNumber ? (
                    <span className="safe-deal-moderation__phone">
                      {row.userPhoneNumber}
                    </span>
                  ) : null}
                </div>

                <div className="safe-deal-moderation__inn-row">
                  <span className="safe-deal-moderation__legal-form">
                    {SELLER_LEGAL_FORM_LABELS_RU[row.legalForm] ?? row.legalForm}
                  </span>
                  <span className="safe-deal-moderation__inn">{row.inn}</span>
                  <button
                    type="button"
                    className="safe-deal-moderation__copy"
                    onClick={() => handleCopyInn(row.userId, row.inn)}
                  >
                    {copiedUserId === row.userId
                      ? SAFE_DEAL_MODERATION_UI.COPY_INN_DONE
                      : SAFE_DEAL_MODERATION_UI.COPY_INN}
                  </button>
                  <a
                    className="safe-deal-moderation__registry"
                    href={SAFE_DEAL_REGISTRY_CHECK_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={SAFE_DEAL_MODERATION_UI.CHECK_REGISTRY_ARIA}
                  >
                    <ExternalLink size={14} aria-hidden />
                    <span>{SAFE_DEAL_MODERATION_UI.CHECK_REGISTRY}</span>
                  </a>
                </div>

                <dl className="safe-deal-moderation__meta">
                  <div>
                    <dt>{SAFE_DEAL_MODERATION_UI.FIELD_CITY}</dt>
                    <dd>{row.addressCity || row.regionCode || "—"}</dd>
                  </div>
                  <div>
                    <dt>{SAFE_DEAL_MODERATION_UI.FIELD_SUBMITTED}</dt>
                    <dd>{formatSubmittedAt(row.submittedAt)}</dd>
                  </div>
                </dl>

                {status === "rejected" && row.moderationComment ? (
                  <p className="safe-deal-moderation__reason">
                    {SAFE_DEAL_MODERATION_UI.REASON_LABEL}: {row.moderationComment}
                  </p>
                ) : null}

                {status === "pending" ? (
                  <>
                    <label className="safe-deal-moderation__comment">
                      <span>{SAFE_DEAL_MODERATION_UI.REASON_LABEL}</span>
                      <input
                        type="text"
                        value={comments[row.userId] ?? ""}
                        onChange={(event) =>
                          setComments((prev) => ({
                            ...prev,
                            [row.userId]: event.target.value,
                          }))
                        }
                        placeholder={SAFE_DEAL_MODERATION_UI.REASON_PLACEHOLDER}
                        maxLength={500}
                        disabled={isRowPending}
                      />
                    </label>

                    {rowError[row.userId] ? (
                      <p className="safe-deal-moderation__row-error" role="alert">
                        {rowError[row.userId]}
                      </p>
                    ) : null}

                    <div className="safe-deal-moderation__actions">
                      <button
                        type="button"
                        className="safe-deal-moderation__approve"
                        onClick={() => handleReview(row.userId, "approved")}
                        disabled={isRowPending}
                      >
                        {isRowPending
                          ? SAFE_DEAL_MODERATION_UI.SAVING
                          : SAFE_DEAL_MODERATION_UI.APPROVE}
                      </button>
                      <button
                        type="button"
                        className="safe-deal-moderation__reject"
                        onClick={() => handleReview(row.userId, "rejected")}
                        disabled={isRowPending}
                      >
                        {SAFE_DEAL_MODERATION_UI.REJECT}
                      </button>
                    </div>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
