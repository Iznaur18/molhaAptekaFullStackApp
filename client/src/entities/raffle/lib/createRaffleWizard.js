import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "../lib/isRafflePrizeVideo.js";
import { CREATE_RAFFLE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isRuRegionCode } from "@molha/api-contract";

/** @typedef {'basic' | 'prize' | 'conditions'} CreateRaffleWizardStepId */

export const CREATE_RAFFLE_WIZARD_STEPS = /** @type {const} */ ([
  "basic",
  "prize",
  "conditions",
]);

/**
 * @param {CreateRaffleWizardStepId} stepId
 */
export function resolveCreateRaffleWizardStepCopy(stepId) {
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
    default:
      return {
        title: "",
        subtitle: "",
        shortLabel: "",
      };
  }
}

/**
 * @param {CreateRaffleWizardStepId} stepId
 * @param {{
 *   title: string;
 *   prizeMediaType: string;
 *   prizeImageUrl: string;
 *   prizeVideoUrl: string;
 *   targetSales: string;
 *   instagramUrl: string;
 *   regionCode?: string;
 * }} form
 * @returns {string | null}
 */
export function validateCreateRaffleFormStep(stepId, form) {
  if (stepId === "basic") {
    if (!String(form.title ?? "").trim()) {
      return CREATE_RAFFLE_MODAL_UI.ERROR_TITLE;
    }
    if (!isRuRegionCode(form.regionCode)) {
      return CREATE_RAFFLE_MODAL_UI.ERROR_REGION_REQUIRED;
    }
    return null;
  }

  if (stepId === "prize") {
    if (
      form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO &&
      !String(form.prizeVideoUrl ?? "").trim()
    ) {
      return CREATE_RAFFLE_MODAL_UI.ERROR_PRIZE_VIDEO;
    }
    if (
      form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE &&
      !String(form.prizeImageUrl ?? "").trim()
    ) {
      return CREATE_RAFFLE_MODAL_UI.ERROR_PRIZE_IMAGE;
    }
    return null;
  }

  const targetSales = Number(form.targetSales);
  if (!Number.isFinite(targetSales) || targetSales < 1) {
    return CREATE_RAFFLE_MODAL_UI.ERROR_TARGET;
  }
  return null;
}

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   prizeMediaType: string;
 *   prizeImageUrl: string;
 *   prizeVideoUrl: string;
 *   targetSales: string;
 *   instagramUrl: string;
 *   regionCode?: string;
 * }} form
 */
export function isCreateRaffleFormDirty(form) {
  return (
    String(form.title ?? "").trim() !== "" ||
    String(form.description ?? "").trim() !== "" ||
    String(form.prizeImageUrl ?? "").trim() !== "" ||
    String(form.prizeVideoUrl ?? "").trim() !== "" ||
    String(form.targetSales ?? "").trim() !== "" ||
    String(form.instagramUrl ?? "").trim() !== "" ||
    form.prizeMediaType !== RAFFLE_PRIZE_MEDIA_TYPE_IMAGE ||
    (Boolean(form.regionCode) && form.regionCode !== "RU-MOW")
  );
}
