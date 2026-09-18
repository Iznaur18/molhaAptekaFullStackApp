import mongoose from "mongoose";
import {
  MARKETING_TOUCH_FIELD_MAX,
  MARKETING_TOUCH_PATH_MAX,
} from "@izibuy/shared-lib";

const { Schema } = mongoose;

const touchText = {
  type: String,
  trim: true,
  maxlength: MARKETING_TOUCH_FIELD_MAX,
  default: "",
};

/** Одно касание: откуда пришёл пользователь (UTM, click id, реферер). */
const MarketingTouchSchema = new Schema(
  {
    source: {
      type: String,
      trim: true,
      maxlength: MARKETING_TOUCH_FIELD_MAX,
      required: true,
    },
    medium: touchText,
    campaign: touchText,
    content: touchText,
    term: touchText,
    clickId: touchText,
    referrerHost: touchText,
    landingPath: { ...touchText, maxlength: MARKETING_TOUCH_PATH_MAX },
    capturedAt: { type: Date, required: true },
  },
  { _id: false },
);

/** Первое и последнее касание до регистрации (см. shared-lib marketingAttribution). */
export const MarketingAttributionSchema = new Schema(
  {
    firstTouch: { type: MarketingTouchSchema, default: null },
    lastTouch: { type: MarketingTouchSchema, default: null },
  },
  { _id: false },
);
