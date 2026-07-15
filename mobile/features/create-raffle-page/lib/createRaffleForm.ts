import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "@/entities/raffle/lib/raffleConstants";
import { DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS, getRafflePrizeImageFocus } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

import {
  CREATE_RAFFLE_WIZARD_STEPS,
  validateCreateRaffleFormStep,
} from "./createRaffleWizardSteps";

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

export const isCreateRaffleFormDirty = (form: CreateRaffleFormState): boolean =>
  form.title.trim() !== "" ||
  form.description.trim() !== "" ||
  form.prizeImageUrl.trim() !== "" ||
  form.prizeVideoUrl.trim() !== "" ||
  form.targetSales.trim() !== "" ||
  form.instagramUrl.trim() !== "" ||
  form.prizeMediaType !== INITIAL_CREATE_RAFFLE_FORM.prizeMediaType;

export const validateCreateRaffleForm = (form: CreateRaffleFormState): string | null => {
  for (const stepId of CREATE_RAFFLE_WIZARD_STEPS) {
    const stepError = validateCreateRaffleFormStep(stepId, form);
    if (stepError) {
      return stepError;
    }
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

export {
  CREATE_RAFFLE_WIZARD_STEPS,
  resolveCreateRaffleWizardStepCopy,
  validateCreateRaffleFormStep,
  type CreateRaffleWizardStepId,
} from "./createRaffleWizardSteps";
