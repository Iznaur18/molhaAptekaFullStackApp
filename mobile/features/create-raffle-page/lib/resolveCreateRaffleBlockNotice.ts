import { CREATE_RAFFLE_MODAL_UI } from "@/shared/config";

const CREATE_BLOCKING_STATUSES = new Set(["pending_staff", "active", "paused"]);

export const isRaffleBlockingCreate = (status: string | null | undefined): boolean =>
  Boolean(status && CREATE_BLOCKING_STATUSES.has(status));

export const canWithdrawRaffleFromModeration = (status: string | null | undefined): boolean =>
  status === "pending_staff";

export const resolveCreateRaffleBlockNotice = (raffle: {
  title?: string | null;
  status?: string | null;
} | null): { message: string; canWithdraw: boolean } | null => {
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
};
