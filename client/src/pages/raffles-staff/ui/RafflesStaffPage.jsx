import { useCallback, useEffect, useState } from "react";

import { approveRaffle } from "../../../entities/raffle/api/approveRaffle.js";
import { deleteRaffleByStaff } from "../../../entities/raffle/api/deleteRaffleByStaff.js";
import { fetchFeaturedRaffles } from "../../../entities/raffle/api/fetchFeaturedRaffle.js";
import { fetchPendingRaffles } from "../../../entities/raffle/api/fetchPendingRaffles.js";
import { rejectRaffle } from "../../../entities/raffle/api/rejectRaffle.js";
import { formatRafflePrizeImageObjectPosition } from "../../../entities/raffle/lib/rafflePrizeImageFocus.js";
import { RaffleManageActions } from "../../../entities/raffle/ui/RaffleManageActions.jsx";
import {
  API_CLIENT_UI,
  RAFFLE_MANAGE_UI,
  RAFFLES_STAFF_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./RafflesStaffPage.css";

const LIVE_SITE_STATUSES = new Set(["active", "paused", "completed"]);

/**
 * @param {{
 *   refreshTick?: number;
 *   onQueueChanged?: () => void;
 *   onEditRaffle?: (raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi) => void;
 * }} props
 */
export function RafflesStaffPage({
  refreshTick = 0,
  onQueueChanged,
  onEditRaffle,
}) {
  const [phase, setPhase] = useState("loading");
  const [raffles, setRaffles] = useState(
    /** @type {import('../../../entities/raffle/model/types.js').RaffleFromApi[]} */ ([]),
  );
  const [liveRaffle, setLiveRaffle] = useState(
    /** @type {import('../../../entities/raffle/model/types.js').RaffleFromApi | null} */ (null),
  );
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [rowErrors, setRowErrors] = useState(/** @type {Record<string, string>} */ ({}));

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const [list, featuredList] = await Promise.all([
        fetchPendingRaffles(),
        fetchFeaturedRaffles(),
      ]);
      setRaffles(list);
      const vitrineRaffle =
        featuredList.find((row) => row.status === "active") ??
        featuredList.find((row) => LIVE_SITE_STATUSES.has(row.status)) ??
        null;
      setLiveRaffle(
        vitrineRaffle && LIVE_SITE_STATUSES.has(vitrineRaffle.status)
          ? vitrineRaffle
          : null,
      );
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_RAFFLES_QUEUE_FALLBACK,
      );
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, refreshTick]);

  const removeRow = (raffleId) => {
    setRaffles((prev) => prev.filter((row) => String(row._id) !== raffleId));
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
      await approveRaffle(raffleId);
      removeRow(raffleId);
      onQueueChanged?.();
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
      await rejectRaffle(raffleId);
      removeRow(raffleId);
      onQueueChanged?.();
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
    if (!window.confirm(RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF)) return;
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await deleteRaffleByStaff(raffleId);
      removeRow(raffleId);
      if (clearLive) {
        setLiveRaffle(null);
      }
      onQueueChanged?.();
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

  if (phase === "loading") {
    return (
      <p className="raffles-staff-page__state">{RAFFLES_STAFF_PAGE_UI.LOADING}</p>
    );
  }

  if (phase === "error") {
    return (
      <p className="raffles-staff-page__state raffles-staff-page__state_error" role="alert">
        {error}
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
              <img
                src={liveRaffle.prizeImageUrl}
                alt=""
                className="raffles-staff-page__thumb"
                style={{
                  objectPosition: formatRafflePrizeImageObjectPosition(liveRaffle),
                }}
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
              onEdit={
                onEditRaffle ? () => onEditRaffle(liveRaffle) : undefined
              }
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
                  <img
                    src={raffle.prizeImageUrl}
                    alt=""
                    className="raffles-staff-page__thumb"
                    style={{
                      objectPosition: formatRafflePrizeImageObjectPosition(raffle),
                    }}
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
                    {busy ? RAFFLES_STAFF_PAGE_UI.PENDING : RAFFLES_STAFF_PAGE_UI.APPROVE}
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
