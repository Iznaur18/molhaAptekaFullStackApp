import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "@/entities/raffle/lib/raffleConstants";
import { DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS, getRafflePrizeImageFocus } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { CREATE_RAFFLE_PAGE_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export type PrizeMediaType =
  | typeof RAFFLE_PRIZE_MEDIA_TYPE_IMAGE
  | typeof RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;

export type CreateRaffleFormState = {
  title: string;
  description: string;
  prizeMediaType: PrizeMediaType;
  prizeImageUrl: string;
  prizeVideoUrl: string;
  prizeImageFocus: { x: number; y: number };
  targetSales: string;
  instagramUrl: string;
};

export const INITIAL_CREATE_RAFFLE_FORM: CreateRaffleFormState = {
  title: "",
  description: "",
  prizeMediaType: RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  prizeImageUrl: "",
  prizeVideoUrl: "",
  prizeImageFocus: { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS },
  targetSales: "",
  instagramUrl: "",
};

export const formFromRaffle = (raffle: RaffleFromApi): CreateRaffleFormState => {
  const prizeMediaType =
    raffle.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO
      ? RAFFLE_PRIZE_MEDIA_TYPE_VIDEO
      : RAFFLE_PRIZE_MEDIA_TYPE_IMAGE;

  return {
    title: raffle.title ?? "",
    description: raffle.description ?? "",
    prizeMediaType,
    prizeImageUrl: raffle.prizeImageUrl ?? "",
    prizeVideoUrl: raffle.prizeVideoUrl ?? "",
    prizeImageFocus: getRafflePrizeImageFocus(raffle),
    targetSales: String(raffle.targetSales ?? ""),
    instagramUrl: raffle.instagramUrl ?? "",
  };
};

export const buildCreateRaffleSubmitBody = (form: CreateRaffleFormState) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  prizeMediaType: form.prizeMediaType,
  prizeImageUrl: resolveUploadedMediaUrl(form.prizeImageUrl.trim()),
  prizeVideoUrl: resolveUploadedMediaUrl(form.prizeVideoUrl.trim()),
  prizeImageFocus: form.prizeImageFocus,
  targetSales: Number(form.targetSales),
  instagramUrl: form.instagramUrl.trim(),
});

export const validateCreateRaffleForm = (form: CreateRaffleFormState): string | null => {
  if (!form.title.trim()) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_TITLE;
  }

  const targetSales = Number(form.targetSales);
  if (!Number.isFinite(targetSales) || targetSales < 1) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_TARGET;
  }

  if (!form.instagramUrl.trim()) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_INSTAGRAM;
  }

  if (form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO && !form.prizeVideoUrl.trim()) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_VIDEO;
  }

  if (form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE && !form.prizeImageUrl.trim()) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_IMAGE;
  }

  return null;
};

export const applyCreateRaffleMediaTypeChange = (
  prev: CreateRaffleFormState,
  prizeMediaType: PrizeMediaType,
): CreateRaffleFormState => ({
  ...prev,
  prizeMediaType,
  prizeImageUrl:
    prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO ? "" : prev.prizeImageUrl,
  prizeVideoUrl:
    prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE ? "" : prev.prizeVideoUrl,
  prizeImageFocus:
    prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO
      ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
      : prev.prizeImageFocus,
});
