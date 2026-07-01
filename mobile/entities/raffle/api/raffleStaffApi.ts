import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import { fetchFeaturedRaffles } from "./fetchFeaturedRaffles";

import type { RaffleFromApi } from "../model/types";

export type StaffRafflesQueueData = {
  pendingRaffles: RaffleFromApi[];
  liveRaffle: RaffleFromApi | null;
};

export const fetchPendingRaffles = async (): Promise<RaffleFromApi[]> => {
  try {
    const { data } = await apiClient.get("/product/raffles/pending");
    if (!data?.success || !Array.isArray(data.data?.raffles)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffles as RaffleFromApi[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_RAFFLES_QUEUE_FALLBACK));
  }
};

export const approveRaffle = async (raffleId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}/approve`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.APPROVE_RAFFLE_FALLBACK));
  }
};

export const rejectRaffle = async (raffleId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}/reject`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.REJECT_RAFFLE_FALLBACK));
  }
};

export const deleteRaffleByStaff = async (raffleId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/raffles/${raffleId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK));
  }
};

export const fetchStaffRafflesQueue = async (): Promise<StaffRafflesQueueData> => {
  const [pendingRaffles, featuredList] = await Promise.all([
    fetchPendingRaffles(),
    fetchFeaturedRaffles(),
  ]);
  const liveRaffle =
    featuredList.find((row) => row.status === "active") ??
    featuredList.find((row) => ["active", "paused", "completed"].includes(String(row.status))) ??
    null;
  return { pendingRaffles, liveRaffle };
};
