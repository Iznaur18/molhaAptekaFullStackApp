import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useInstallmentMutations } from "../../../entities/installment/model/useInstallmentMutations.js";
import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import { usePendingInstallmentDisputesQuery } from "../../../entities/installment/model/usePendingInstallmentDisputesQuery.js";
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
  const queryClient = useQueryClient();
  const { resolveDisputeMutation } = useInstallmentMutations();
  const disputesQuery = usePendingInstallmentDisputesQuery();
  const [actionError, setActionError] = useState("");
  const [pendingDisputeId, setPendingDisputeId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [partialRefundRub, setPartialRefundRub] = useState(
    /** @type {Record<string, string>} */ ({}),
  );

  const disputes = disputesQuery.data ?? [];
  const phase = disputesQuery.isPending
    ? "loading"
    : disputesQuery.isError && disputes.length === 0
      ? "error"
      : "success";
  const error =
    disputesQuery.error instanceof Error
      ? disputesQuery.error.message
      : INSTALLMENT_UI.ERROR_GENERIC;

  const removeFromQueue = (disputeId) => {
    queryClient.setQueryData(installmentQueryKeys.disputesPending(), (old) => {
      if (!Array.isArray(old)) {
        return old;
      }
      return old.filter((row) => row._id !== disputeId);
    });
  };

  const handleResolve = async (disputeId, action) => {
    try {
      setPendingDisputeId(disputeId);
      setActionError("");
      await resolveDisputeMutation.mutateAsync({
        disputeId,
        body: {
          action,
          resolutionNote: resolutionNotes[disputeId] ?? "",
          ...(action === "partial_refund"
            ? { partialRefundRub: Number(partialRefundRub[disputeId]) || 0 }
            : {}),
        },
      });
      removeFromQueue(disputeId);
      onQueueChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
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
      <p className="installment-disputes-page__state">{INSTALLMENT_UI.DISPUTES_PAGE_EMPTY}</p>
    );
  }

  return (
    <div className="installment-disputes-page">
      {actionError ? (
        <p
          className="installment-disputes-page__state installment-disputes-page__state_error"
          role="alert"
        >
          {actionError}
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
