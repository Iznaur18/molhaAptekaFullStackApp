import { useState } from "react";

import { canSellerEditRaffle } from "../lib/canSellerEditRaffle.js";
import { useRaffleMutations } from "../model/useRaffleMutations.js";
import { useMyRaffleQuery } from "../model/useMyRaffleQuery.js";
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
 *   onChanged?: () => void;
 *   onEditRaffle?: (raffle: import('../model/types.js').RaffleFromApi) => void;
 * }} props
 */
export function RaffleSellerOverview({ onChanged, onEditRaffle }) {
  const { pauseMyMutation, deleteMyMutation } = useRaffleMutations();
  const myRaffleQuery = useMyRaffleQuery({ enabled: true });
  const [actionError, setActionError] = useState("");

  const raffle = myRaffleQuery.data?.raffle ?? null;
  const archive = myRaffleQuery.data?.archive ?? [];

  const handlePause = async () => {
    if (!raffle?._id) {
      return;
    }
    try {
      setActionError("");
      await pauseMyMutation.mutateAsync(raffle._id);
      onChanged?.();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK,
      );
    }
  };

  const handleDelete = async () => {
    if (!raffle?._id) {
      return;
    }
    if (!window.confirm(RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER)) {
      return;
    }
    try {
      setActionError("");
      await deleteMyMutation.mutateAsync(raffle._id);
      onChanged?.();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : API_CLIENT_UI.DELETE_RAFFLE_FALLBACK,
      );
    }
  };

  if (myRaffleQuery.isPending) {
    return <p className="raffle-seller-overview__state">Загрузка…</p>;
  }

  if (myRaffleQuery.isError) {
    const message =
      myRaffleQuery.error instanceof Error
        ? myRaffleQuery.error.message
        : API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK;
    return (
      <p
        className="raffle-seller-overview__state raffle-seller-overview__state_error"
        role="alert"
      >
        {message}
      </p>
    );
  }

  const actionsBusy = pauseMyMutation.isPending || deleteMyMutation.isPending;
  const showEdit = canSellerEditRaffle(raffle) && Boolean(onEditRaffle);

  return (
    <div className="raffle-seller-overview">
      <h3 className="raffle-seller-overview__title">{RAFFLE_SELLER_PANEL_UI.TITLE}</h3>
      {actionError ? (
        <p className="raffle-seller-overview__state_error" role="alert">
          {actionError}
        </p>
      ) : null}
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
