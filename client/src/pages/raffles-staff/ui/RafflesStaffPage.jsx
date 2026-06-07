import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useRaffleMutations } from "../../../entities/raffle/model/useRaffleMutations.js";
import { syncRafflesStaffQueueCaches } from "../../../pages/home/lib/staffBadgeQueryCache.js";
import { raffleQueryKeys } from "../../../entities/raffle/model/raffleQueryKeys.js";
import { useStaffRafflesQueueQuery } from "../../../entities/raffle/model/useStaffRafflesQueueQuery.js";
import { RaffleManageActions } from "../../../entities/raffle/ui/RaffleManageActions.jsx";
import { RafflePrizeMedia } from "../../../entities/raffle/ui/RafflePrizeMedia.jsx";
import {
  API_CLIENT_UI,
  RAFFLE_MANAGE_UI,
  RAFFLES_STAFF_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./RafflesStaffPage.css";

/**
 * @param {{
 *   onQueueChanged?: () => void;
 *   onEditRaffle?: (raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi) => void;
 * }} props
 */
export function RafflesStaffPage({ onQueueChanged, onEditRaffle }) {
  const queryClient = useQueryClient();
  const { approveMutation, rejectMutation, deleteStaffMutation } = useRaffleMutations();
  const queueQuery = useStaffRafflesQueueQuery();
  const [pendingId, setPendingId] = useState(null);
  const [rowErrors, setRowErrors] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [clearedLiveRaffleId, setClearedLiveRaffleId] = useState(
    /** @type {string | null} */ (null),
  );

  const raffles = queueQuery.data?.pendingRaffles ?? [];
  const liveRaffleFromQuery = queueQuery.data?.liveRaffle ?? null;
  const liveRaffle =
    clearedLiveRaffleId != null &&
    liveRaffleFromQuery?._id != null &&
    String(liveRaffleFromQuery._id) === clearedLiveRaffleId
      ? null
      : liveRaffleFromQuery;

  const removeRow = (raffleId) => {
    queryClient.setQueryData(
      raffleQueryKeys.staffQueue(),
      (
        /** @type {{ pendingRaffles: import('../../../entities/raffle/model/types.js').RaffleFromApi[]; liveRaffle: import('../../../entities/raffle/model/types.js').RaffleFromApi | null } | undefined} */ old,
      ) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pendingRaffles: old.pendingRaffles.filter(
            (row) => String(row._id) !== raffleId,
          ),
        };
      },
    );
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[raffleId];
      return next;
    });
  };

  const handleApprove = async (raffleId) => {
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await approveMutation.mutateAsync(raffleId);
      removeRow(raffleId);
      void syncRafflesStaffQueueCaches(queryClient);
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [raffleId]:
          e instanceof Error ? e.message : API_CLIENT_UI.APPROVE_RAFFLE_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (raffleId) => {
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await rejectMutation.mutateAsync(raffleId);
      removeRow(raffleId);
      void syncRafflesStaffQueueCaches(queryClient);
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [raffleId]:
          e instanceof Error ? e.message : API_CLIENT_UI.REJECT_RAFFLE_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (raffleId, { clearLive = false } = {}) => {
    if (!window.confirm(RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF)) {
      return;
    }
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await deleteStaffMutation.mutateAsync(raffleId);
      removeRow(raffleId);
      if (clearLive) {
        setClearedLiveRaffleId(raffleId);
      }
      void syncRafflesStaffQueueCaches(queryClient);
    } catch (e) {
      setRowErrors((prev) => ({
        ...prev,
        [raffleId]:
          e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
      }));
    } finally {
      setPendingId(null);
    }
  };

  if (queueQuery.isPending) {
    return <p className="raffles-staff-page__state">{RAFFLES_STAFF_PAGE_UI.LOADING}</p>;
  }

  if (queueQuery.isError) {
    const message =
      queueQuery.error instanceof Error
        ? queueQuery.error.message
        : API_CLIENT_UI.FETCH_RAFFLES_QUEUE_FALLBACK;
    return (
      <p
        className="raffles-staff-page__state raffles-staff-page__state_error"
        role="alert"
      >
        {message}
      </p>
    );
  }

  const liveBusy = liveRaffle != null && pendingId === liveRaffle._id;

  return (
    <div className="raffles-staff-page">
      {liveRaffle ? (
        <section className="raffles-staff-page__live">
          <h3 className="raffles-staff-page__live-title">
            {RAFFLE_MANAGE_UI.LIVE_SECTION_TITLE}
          </h3>
          <div className="raffles-staff-page__row raffles-staff-page__row_live">
            <div className="raffles-staff-page__row-main">
              <RafflePrizeMedia
                raffle={liveRaffle}
                className="raffles-staff-page__thumb"
                imageClassName="raffles-staff-page__thumb"
                videoClassName="raffles-staff-page__thumb raffles-staff-page__thumb_video"
              />
              <div>
                <p className="raffles-staff-page__title">{liveRaffle.title}</p>
                <p className="raffles-staff-page__meta">
                  {RAFFLES_STAFF_PAGE_UI.ROW_SELLER}:{" "}
                  {liveRaffle.seller?.userName ?? "—"}
                </p>
                <p className="raffles-staff-page__meta">
                  {RAFFLES_STAFF_PAGE_UI.ROW_TARGET}: {liveRaffle.targetSales}
                  {liveRaffle.status === "active" || liveRaffle.status === "completed"
                    ? ` · ${liveRaffle.salesProgress} / ${liveRaffle.targetSales}`
                    : ""}
                </p>
              </div>
            </div>
            {rowErrors[liveRaffle._id] ? (
              <p className="raffles-staff-page__row-error" role="alert">
                {rowErrors[liveRaffle._id]}
              </p>
            ) : null}
            <RaffleManageActions
              className="raffles-staff-page__manage"
              showEdit={Boolean(onEditRaffle)}
              showDelete
              onEdit={onEditRaffle ? () => onEditRaffle(liveRaffle) : undefined}
              onDelete={() => void handleDelete(liveRaffle._id, { clearLive: true })}
              busy={liveBusy}
            />
          </div>
        </section>
      ) : null}

      <h3 className="raffles-staff-page__queue-title">
        {RAFFLES_STAFF_PAGE_UI.QUEUE_TITLE}
      </h3>

      {raffles.length === 0 ? (
        <p className="raffles-staff-page__state">{RAFFLES_STAFF_PAGE_UI.EMPTY}</p>
      ) : (
        <ul className="raffles-staff-page__list">
          {raffles.map((raffle) => {
            const busy = pendingId === raffle._id;
            return (
              <li key={raffle._id} className="raffles-staff-page__row">
                <div className="raffles-staff-page__row-main">
                  <RafflePrizeMedia
                    raffle={raffle}
                    className="raffles-staff-page__thumb"
                    imageClassName="raffles-staff-page__thumb"
                    videoClassName="raffles-staff-page__thumb raffles-staff-page__thumb_video"
                  />
                  <div>
                    <p className="raffles-staff-page__title">{raffle.title}</p>
                    <p className="raffles-staff-page__meta">
                      {RAFFLES_STAFF_PAGE_UI.ROW_SELLER}:{" "}
                      {raffle.seller?.userName ?? "—"}
                    </p>
                    <p className="raffles-staff-page__meta">
                      {RAFFLES_STAFF_PAGE_UI.ROW_TARGET}: {raffle.targetSales}
                    </p>
                  </div>
                </div>
                {rowErrors[raffle._id] ? (
                  <p className="raffles-staff-page__row-error" role="alert">
                    {rowErrors[raffle._id]}
                  </p>
                ) : null}
                <div className="raffles-staff-page__actions">
                  <button
                    type="button"
                    className="app-btn app-btn--primary"
                    disabled={busy}
                    onClick={() => void handleApprove(raffle._id)}
                  >
                    {busy
                      ? RAFFLES_STAFF_PAGE_UI.PENDING
                      : RAFFLES_STAFF_PAGE_UI.APPROVE}
                  </button>
                  <button
                    type="button"
                    className="raffles-staff-page__reject"
                    disabled={busy}
                    onClick={() => void handleReject(raffle._id)}
                  >
                    {RAFFLES_STAFF_PAGE_UI.REJECT}
                  </button>
                  {onEditRaffle ? (
                    <button
                      type="button"
                      className="raffles-staff-page__edit"
                      disabled={busy}
                      onClick={() => onEditRaffle(raffle)}
                    >
                      {RAFFLES_STAFF_PAGE_UI.EDIT}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="raffles-staff-page__delete"
                    disabled={busy}
                    onClick={() => void handleDelete(raffle._id)}
                  >
                    {RAFFLES_STAFF_PAGE_UI.DELETE}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
