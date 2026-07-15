import { CREATE_RAFFLE_MODAL_UI } from "../../../shared/config/appUiCopy.js";

const CREATE_BLOCKING_STATUSES = new Set(["pending_staff", "active", "paused"]);

export function isRaffleBlockingCreate(status) {
  return Boolean(status && CREATE_BLOCKING_STATUSES.has(status));
}

export function canWithdrawRaffleFromModeration(status) {
  return status === "pending_staff";
}

/**
 * @param {{ title?: string | null; status?: string | null } | null | undefined} raffle
 * @returns {{ message: string; canWithdraw: boolean } | null}
 */
export function resolveCreateRaffleBlockNotice(raffle) {
  if (!raffle || !isRaffleBlockingCreate(raffle.status)) {
    return null;
  }

  const title = String(raffle.title ?? "").trim() || "без названия";

  if (raffle.status === "pending_staff") {
    return {
      message: CREATE_RAFFLE_MODAL_UI.EXISTING_PENDING(title),
      canWithdraw: true,
    };
  }

  return {
    message: CREATE_RAFFLE_MODAL_UI.EXISTING_IN_PROGRESS(title),
    canWithdraw: false,
  };
}
