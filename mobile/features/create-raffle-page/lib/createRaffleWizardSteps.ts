import { isRuRegionCode } from "@molha/api-contract";

import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "@/entities/raffle/lib/raffleConstants";
import { CREATE_RAFFLE_MODAL_UI, CREATE_RAFFLE_PAGE_UI } from "@/shared/config";

import type { CreateRaffleFormState } from "./createRaffleForm";

export const CREATE_RAFFLE_WIZARD_STEPS = ["basic", "prize", "conditions"] as const;

export type CreateRaffleWizardStepId = (typeof CREATE_RAFFLE_WIZARD_STEPS)[number];

export const resolveCreateRaffleWizardStepCopy = (stepId: CreateRaffleWizardStepId) => {
  switch (stepId) {
    case "basic":
      return {
        title: CREATE_RAFFLE_MODAL_UI.SECTION_BASIC,
        subtitle: CREATE_RAFFLE_MODAL_UI.STEP_SUBTITLE_BASIC,
        shortLabel: CREATE_RAFFLE_MODAL_UI.SECTION_BASIC,
      };
    case "prize":
      return {
        title: CREATE_RAFFLE_MODAL_UI.SECTION_PRIZE,
        subtitle: CREATE_RAFFLE_MODAL_UI.STEP_SUBTITLE_PRIZE,
        shortLabel: CREATE_RAFFLE_MODAL_UI.SECTION_PRIZE,
      };
    case "conditions":
      return {
        title: CREATE_RAFFLE_MODAL_UI.SECTION_CONDITIONS,
        subtitle: CREATE_RAFFLE_MODAL_UI.STEP_SUBTITLE_CONDITIONS,
        shortLabel: CREATE_RAFFLE_MODAL_UI.SECTION_CONDITIONS,
      };
    default: {
      const _exhaustive: never = stepId;
      return _exhaustive;
    }
  }
};

export const validateCreateRaffleFormStep = (
  stepId: CreateRaffleWizardStepId,
  form: CreateRaffleFormState,
): string | null => {
  if (stepId === "basic") {
    if (!form.title.trim()) {
      return CREATE_RAFFLE_PAGE_UI.ERROR_TITLE;
    }
    if (!isRuRegionCode(form.regionCode)) {
      return CREATE_RAFFLE_PAGE_UI.ERROR_REGION_REQUIRED;
    }
    return null;
  }

  if (stepId === "prize") {
    if (form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO && !form.prizeVideoUrl.trim()) {
      return CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_VIDEO;
    }
    if (form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE && !form.prizeImageUrl.trim()) {
      return CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_IMAGE;
    }
    return null;
  }

  const targetSales = Number(form.targetSales);
  if (!Number.isFinite(targetSales) || targetSales < 1) {
    return CREATE_RAFFLE_PAGE_UI.ERROR_TARGET;
  }
  return null;
};
