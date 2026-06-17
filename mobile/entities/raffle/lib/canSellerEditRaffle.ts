import type { MyRaffleRecord } from "@/entities/raffle/api/fetchMyRaffle";
import type { RaffleFromApi } from "@/entities/raffle/model/types";

type EditableRaffle = MyRaffleRecord | RaffleFromApi | null | undefined;

export const canSellerEditRaffle = (raffle: EditableRaffle): boolean => {
  if (!raffle) {
    return false;
  }

  return (
    raffle.status === "pending_staff" ||
    raffle.status === "active" ||
    raffle.status === "paused"
  );
};
