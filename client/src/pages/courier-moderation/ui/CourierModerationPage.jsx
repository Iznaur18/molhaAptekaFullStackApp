import { useState } from "react";

import {
  useCourierApplicationsQuery,
  useReviewCourierApplicationMutation,
} from "../../../entities/courier/model/courierQueries.js";
import { CourierDocumentThumb } from "../../../entities/courier/ui/CourierDocumentThumb.jsx";
import { COURIER_MODERATION_UI } from "../../../shared/config/appUiCopy.js";

import "./CourierModerationPage.css";

/** Снимки заявки в том порядке, в каком их просят у курьера. */
const DOCUMENT_FIELDS = [
  { field: "vehiclePhotoFrontUrl", label: COURIER_MODERATION_UI.PHOTO_FRONT },
  { field: "vehiclePhotoRearUrl", label: COURIER_MODERATION_UI.PHOTO_REAR },
  { field: "driverLicensePhotoUrl", label: COURIER_MODERATION_UI.PHOTO_LICENSE },
  {
    field: "vehicleRegistrationPhotoUrl",
    label: COURIER_MODERATION_UI.PHOTO_REGISTRATION,
  },
];

const TABS = [
  { status: "pending", label: COURIER_MODERATION_UI.TAB_PENDING },
  { status: "approved", label: COURIER_MODERATION_UI.TAB_APPROVED },
  { status: "rejected", label: COURIER_MODERATION_UI.TAB_REJECTED },
];

/**
 * Очередь заявок курьеров. Модератор видит данные авто и регион, паспорта
 * здесь нет и быть не должно.
 *
 * @param {{ onQueueChanged?: () => void; onApplicantClick?: (userId: string) => void }} props
 */
export function CourierModerationPage({ onQueueChanged, onApplicantClick }) {
  const [status, setStatus] = useState("pending");
  const [comments, setComments] = useState(/** @type {Record<string, string>} */ ({}));
  const [rowError, setRowError] = useState(/** @type {Record<string, string>} */ ({}));
  const [pendingUserId, setPendingUserId] = useState(/** @type {string | null} */ (null));

  const queueQuery = useCourierApplicationsQuery({ status });
  const reviewMutation = useReviewCourierApplicationMutation();

  const applications = queueQuery.data?.applications ?? [];

  /** @param {string} userId @param {"approved" | "rejected"} nextStatus */
  const handleReview = async (userId, nextStatus) => {
    const comment = (comments[userId] ?? "").trim();
    if (nextStatus === "rejected" && !comment) {
      setRowError((prev) => ({
        ...prev,
        [userId]: COURIER_MODERATION_UI.REASON_REQUIRED,
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
          e instanceof Error ? e.message : COURIER_MODERATION_UI.ERROR_GENERIC,
      }));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="courier-moderation">
      <header className="courier-moderation__header">
        <h2 className="courier-moderation__title">{COURIER_MODERATION_UI.TITLE}</h2>
        <div className="courier-moderation__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={status === tab.status}
              className="courier-moderation__tab"
              onClick={() => setStatus(tab.status)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {queueQuery.isPending ? (
        <p className="courier-moderation__loading">{COURIER_MODERATION_UI.LOADING}</p>
      ) : queueQuery.isError ? (
        <p className="courier-moderation__error" role="alert">
          {queueQuery.error instanceof Error
            ? queueQuery.error.message
            : COURIER_MODERATION_UI.ERROR_GENERIC}
        </p>
      ) : applications.length === 0 ? (
        <p className="courier-moderation__empty">{COURIER_MODERATION_UI.EMPTY}</p>
      ) : (
        <ul className="courier-moderation__list" role="list">
          {applications.map((row) => {
            const isRowPending = pendingUserId === row.userId;
            return (
              <li key={row.userId} className="courier-moderation__card">
                <div className="courier-moderation__who">
                  {onApplicantClick ? (
                    <button
                      type="button"
                      className="courier-moderation__name-link"
                      onClick={() => onApplicantClick(row.userId)}
                    >
                      {row.userName || COURIER_MODERATION_UI.NO_NAME}
                    </button>
                  ) : (
                    <span className="courier-moderation__name">
                      {row.userName || COURIER_MODERATION_UI.NO_NAME}
                    </span>
                  )}
                  {row.userPhoneNumber ? (
                    <span className="courier-moderation__phone">
                      {row.userPhoneNumber}
                    </span>
                  ) : null}
                </div>

                <dl className="courier-moderation__vehicle">
                  <div>
                    <dt>{COURIER_MODERATION_UI.FIELD_MAKE}</dt>
                    <dd>{row.vehicleMake}</dd>
                  </div>
                  <div>
                    <dt>{COURIER_MODERATION_UI.FIELD_COLOR}</dt>
                    <dd>{row.vehicleColor}</dd>
                  </div>
                  <div>
                    <dt>{COURIER_MODERATION_UI.FIELD_PLATE}</dt>
                    <dd className="courier-moderation__plate">{row.vehiclePlate}</dd>
                  </div>
                  <div>
                    <dt>{COURIER_MODERATION_UI.FIELD_REGION}</dt>
                    <dd>{row.addressCity || row.regionCode || "—"}</dd>
                  </div>
                  {row.declinedJobCount > 0 ? (
                    <div>
                      <dt>{COURIER_MODERATION_UI.FIELD_DECLINED}</dt>
                      <dd>{row.declinedJobCount}</dd>
                    </div>
                  ) : null}
                </dl>

                {(() => {
                  const photos = DOCUMENT_FIELDS.filter(({ field }) => row[field]);
                  if (photos.length === 0) {
                    return (
                      <p className="courier-moderation__no-photos">
                        {COURIER_MODERATION_UI.PHOTO_MISSING}
                      </p>
                    );
                  }
                  return (
                    <div className="courier-moderation__photos">
                      {photos.map(({ field, label }) => (
                        <CourierDocumentThumb
                          key={field}
                          url={row[field]}
                          label={label}
                          failedLabel={COURIER_MODERATION_UI.ERROR_GENERIC}
                        />
                      ))}
                    </div>
                  );
                })()}

                {status === "rejected" && row.moderationComment ? (
                  <p className="courier-moderation__reason">
                    {COURIER_MODERATION_UI.REASON_LABEL}: {row.moderationComment}
                  </p>
                ) : null}

                {status === "pending" ? (
                  <>
                    <label className="courier-moderation__comment">
                      <span>{COURIER_MODERATION_UI.REASON_LABEL}</span>
                      <input
                        type="text"
                        value={comments[row.userId] ?? ""}
                        onChange={(event) =>
                          setComments((prev) => ({
                            ...prev,
                            [row.userId]: event.target.value,
                          }))
                        }
                        placeholder={COURIER_MODERATION_UI.REASON_PLACEHOLDER}
                        maxLength={500}
                        disabled={isRowPending}
                      />
                    </label>

                    {rowError[row.userId] ? (
                      <p className="courier-moderation__row-error" role="alert">
                        {rowError[row.userId]}
                      </p>
                    ) : null}

                    <div className="courier-moderation__actions">
                      <button
                        type="button"
                        className="courier-moderation__approve"
                        onClick={() => handleReview(row.userId, "approved")}
                        disabled={isRowPending}
                      >
                        {isRowPending
                          ? COURIER_MODERATION_UI.SAVING
                          : COURIER_MODERATION_UI.APPROVE}
                      </button>
                      <button
                        type="button"
                        className="courier-moderation__reject"
                        onClick={() => handleReview(row.userId, "rejected")}
                        disabled={isRowPending}
                      >
                        {COURIER_MODERATION_UI.REJECT}
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
