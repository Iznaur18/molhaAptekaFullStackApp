import type { MyRaffleRecord } from "@/entities/raffle/api/fetchMyRaffle";

export const canSellerEditRaffle = (raffle: MyRaffleRecord | null | undefined): boolean => {
  if (!raffle) {
    return false;
  }

  return (
    raffle.status === "pending_staff" ||
    raffle.status === "active" ||
    raffle.status === "paused"
  );
};
