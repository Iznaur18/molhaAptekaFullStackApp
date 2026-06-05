import { useCallback, useEffect, useState } from "react";

import { deleteMyRaffle } from "../api/deleteMyRaffle.js";
import { fetchMyRaffle } from "../api/fetchMyRaffle.js";
import { pauseMyRaffle } from "../api/pauseMyRaffle.js";
import { canSellerEditRaffle } from "../lib/canSellerEditRaffle.js";
import {
  API_CLIENT_UI,
  RAFFLE_MANAGE_UI,
  RAFFLE_SELLER_PANEL_UI,
} from "../../../shared/config/appUiCopy.js";
import { RaffleManageActions } from "./RaffleManageActions.jsx";

import "./RaffleSellerOverview.css";

const STATUS_LABEL = {
  pending_staff: RAFFLE_SELLER_PANEL_UI.STATUS_PENDING,
  active: RAFFLE_SELLER_PANEL_UI.STATUS_ACTIVE,
  paused: RAFFLE_SELLER_PANEL_UI.STATUS_PAUSED,
  completed: RAFFLE_SELLER_PANEL_UI.STATUS_COMPLETED,
  rejected: RAFFLE_SELLER_PANEL_UI.STATUS_REJECTED,
};

/**
 * @param {{
 *   refreshTick?: number;
 *   onChanged?: () => void;
 *   onEditRaffle?: (raffle: import('../model/types.js').RaffleFromApi) => void;
 * }} props
 */
export function RaffleSellerOverview({ refreshTick = 0, onChanged, onEditRaffle }) {
  const [phase, setPhase] = useState("loading");
  const [raffle, setRaffle] = useState(
    /** @type {import('../model/types.js').RaffleFromApi | null} */ (null),
  );
  const [archive, setArchive] = useState(
    /** @type {import('../model/types.js').RaffleFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [isPausing, setIsPausing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const data = await fetchMyRaffle();
      setRaffle(data.raffle);
      setArchive(data.archive);
      setPhase("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshTick]);

  const handlePause = async () => {
    if (!raffle?._id) return;
    try {
      setIsPausing(true);
      await pauseMyRaffle(raffle._id);
      onChanged?.();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK);
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (!raffle?._id) return;
    if (!window.confirm(RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER)) return;
    try {
      setIsDeleting(true);
      await deleteMyRaffle(raffle._id);
      onChanged?.();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK);
    } finally {
      setIsDeleting(false);
    }
  };

  if (phase === "loading") {
    return <p className="raffle-seller-overview__state">Загрузка…</p>;
  }

  if (phase === "error") {
    return (
      <p
        className="raffle-seller-overview__state raffle-seller-overview__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  const actionsBusy = isPausing || isDeleting;
  const showEdit = canSellerEditRaffle(raffle) && Boolean(onEditRaffle);

  return (
    <div className="raffle-seller-overview">
      <h3 className="raffle-seller-overview__title">{RAFFLE_SELLER_PANEL_UI.TITLE}</h3>
      {!raffle ? (
        <p className="raffle-seller-overview__empty">{RAFFLE_SELLER_PANEL_UI.EMPTY}</p>
      ) : (
        <div className="raffle-seller-overview__current">
          <p className="raffle-seller-overview__name">{raffle.title}</p>
          <p className="raffle-seller-overview__status">
            {STATUS_LABEL[raffle.status] ?? raffle.status}
            {raffle.status === "active" || raffle.status === "completed"
              ? ` · ${raffle.salesProgress} / ${raffle.targetSales}`
              : ""}
          </p>
          {raffle.status === "rejected" && raffle.moderationComment ? (
            <p className="raffle-seller-overview__comment">
              {RAFFLE_SELLER_PANEL_UI.REJECTION_PREFIX} {raffle.moderationComment}
            </p>
          ) : null}
          <RaffleManageActions
            className="raffle-seller-overview__actions"
            showEdit={showEdit}
            showDelete
            showPause={raffle.status === "active"}
            onEdit={onEditRaffle ? () => onEditRaffle(raffle) : undefined}
            onDelete={() => void handleDelete()}
            onPause={() => void handlePause()}
            busy={actionsBusy}
          />
        </div>
      )}
      {archive.length > 0 ? (
        <div className="raffle-seller-overview__archive">
          <h4>{RAFFLE_SELLER_PANEL_UI.ARCHIVE_TITLE}</h4>
          <ul>
            {archive.map((row) => (
              <li key={row._id}>
                {row.title} — {STATUS_LABEL[row.status] ?? row.status}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
