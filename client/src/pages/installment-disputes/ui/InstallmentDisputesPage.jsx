import { useCallback, useEffect, useState } from "react";

import {
  fetchPendingInstallmentDisputes,
  resolveInstallmentDispute,
} from "../../../entities/installment/api/installmentApi.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentDisputesPage.css";

/**
 * @typedef {{
 *   _id: string;
 *   contractId: string;
 *   openedByUserId: string;
 *   reason: string;
 *   status: string;
 *   createdAt: string;
 * }} InstallmentDisputeFromApi
 */

/**
 * @param {{ onQueueChanged?: () => void }} props
 */
export function InstallmentDisputesPage({ onQueueChanged }) {
  const [phase, setPhase] = useState("loading");
  const [disputes, setDisputes] = useState(
    /** @type {InstallmentDisputeFromApi[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [pendingDisputeId, setPendingDisputeId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [partialRefundRub, setPartialRefundRub] = useState(
    /** @type {Record<string, string>} */ ({}),
  );

  const loadQueue = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const list = await fetchPendingInstallmentDisputes();
      setDisputes(list);
      setPhase("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const removeFromQueue = (disputeId) => {
    setDisputes((prev) => prev.filter((row) => row._id !== disputeId));
  };

  const handleResolve = async (disputeId, action) => {
    try {
      setPendingDisputeId(disputeId);
      await resolveInstallmentDispute(disputeId, {
        action,
        resolutionNote: resolutionNotes[disputeId] ?? "",
        ...(action === "partial_refund"
          ? { partialRefundRub: Number(partialRefundRub[disputeId]) || 0 }
          : {}),
      });
      removeFromQueue(disputeId);
      onQueueChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingDisputeId(null);
    }
  };

  if (phase === "loading") {
    return (
      <p className="installment-disputes-page__state">
        {INSTALLMENT_UI.DISPUTES_PAGE_LOADING}
      </p>
    );
  }

  if (phase === "error" && disputes.length === 0) {
    return (
      <p
        className="installment-disputes-page__state installment-disputes-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (disputes.length === 0) {
    return (
      <p className="installment-disputes-page__state">
        {INSTALLMENT_UI.DISPUTES_PAGE_EMPTY}
      </p>
    );
  }

  return (
    <div className="installment-disputes-page">
      {error ? (
        <p
          className="installment-disputes-page__state installment-disputes-page__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="installment-disputes-page__list">
        {disputes.map((dispute) => {
          const isBusy = pendingDisputeId === dispute._id;
          return (
            <article key={dispute._id} className="installment-disputes-page__card">
              <p>
                Контракт: {dispute.contractId}
                <br />
                Причина: {dispute.reason}
              </p>
              <label className="installment-disputes-page__field">
                {INSTALLMENT_UI.DISPUTE_RESOLVE_NOTE}
                <textarea
                  className="installment-disputes-page__textarea"
                  value={resolutionNotes[dispute._id] ?? ""}
                  onChange={(event) =>
                    setResolutionNotes((prev) => ({
                      ...prev,
                      [dispute._id]: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="installment-disputes-page__field">
                {INSTALLMENT_UI.DISPUTE_PARTIAL_AMOUNT}
                <input
                  type="number"
                  min={1}
                  className="installment-disputes-page__input"
                  value={partialRefundRub[dispute._id] ?? ""}
                  onChange={(event) =>
                    setPartialRefundRub((prev) => ({
                      ...prev,
                      [dispute._id]: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="installment-disputes-page__actions">
                <button
                  type="button"
                  className="installment-disputes-page__btn installment-disputes-page__btn_primary"
                  disabled={isBusy}
                  onClick={() => void handleResolve(dispute._id, "close")}
                >
                  {INSTALLMENT_UI.DISPUTE_ACTION_CLOSE}
                </button>
                <button
                  type="button"
                  className="installment-disputes-page__btn"
                  disabled={isBusy}
                  onClick={() => void handleResolve(dispute._id, "cancel")}
                >
                  {INSTALLMENT_UI.DISPUTE_ACTION_CANCEL}
                </button>
                <button
                  type="button"
                  className="installment-disputes-page__btn"
                  disabled={isBusy}
                  onClick={() => void handleResolve(dispute._id, "adjust_schedule")}
                >
                  {INSTALLMENT_UI.DISPUTE_ACTION_ADJUST}
                </button>
                <button
                  type="button"
                  className="installment-disputes-page__btn"
                  disabled={isBusy}
                  onClick={() => void handleResolve(dispute._id, "partial_refund")}
                >
                  {INSTALLMENT_UI.DISPUTE_ACTION_REFUND}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
