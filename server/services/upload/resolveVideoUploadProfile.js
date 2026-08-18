import {
  INTRO_UPLOAD_VIDEO_MAX_BYTES,
  STORY_UPLOAD_VIDEO_MAX_BYTES,
  UPLOAD_VIDEO_MAX_BYTES,
} from "../../constants/uploadConstants.js";
import {
  APP_INTRO_VIDEO_MAX_BITRATE_MBIT,
  APP_INTRO_VIDEO_MAX_DURATION_SEC,
} from "../../constants/appIntroSettingsConstants.js";
import {
  PRODUCT_PREVIEW_VIDEO_CRF,
  PRODUCT_PREVIEW_VIDEO_MAX_BITRATE_MBIT,
  PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC,
  PRODUCT_PREVIEW_VIDEO_MAX_WIDTH_PX,
} from "../../constants/productPreviewVideoConstants.js";
import {
  USER_STORY_VIDEO_MAX_BITRATE_MBIT,
  USER_STORY_VIDEO_MAX_DURATION_SEC,
} from "../../constants/userStoryConstants.js";
import { isIntroVideoUploadRequest } from "./isIntroVideoUploadRequest.js";
import { isProductPreviewVideoUploadRequest } from "./isProductPreviewVideoUploadRequest.js";
import { isStoryVideoUploadRequest } from "./isStoryVideoUploadRequest.js";

/**
 * @param {import('express').Request} req
 * @returns {{
 *   maxBytes: number;
 *   transcodeOptions: { maxDurationSec?: number; maxVideoBitrateMbit?: number };
 * }}
 */
export function resolveVideoUploadProfile(req) {
  if (isIntroVideoUploadRequest(req)) {
    return {
      maxBytes: INTRO_UPLOAD_VIDEO_MAX_BYTES,
      transcodeOptions: {
        maxDurationSec: APP_INTRO_VIDEO_MAX_DURATION_SEC,
        maxVideoBitrateMbit: APP_INTRO_VIDEO_MAX_BITRATE_MBIT,
      },
    };
  }

  if (isStoryVideoUploadRequest(req)) {
    return {
      maxBytes: STORY_UPLOAD_VIDEO_MAX_BYTES,
      transcodeOptions: {
        maxDurationSec: USER_STORY_VIDEO_MAX_DURATION_SEC,
        maxVideoBitrateMbit: USER_STORY_VIDEO_MAX_BITRATE_MBIT,
      },
    };
  }

  if (isProductPreviewVideoUploadRequest(req)) {
    return {
      maxBytes: STORY_UPLOAD_VIDEO_MAX_BYTES,
      transcodeOptions: {
        maxDurationSec: PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC,
        maxVideoBitrateMbit: PRODUCT_PREVIEW_VIDEO_MAX_BITRATE_MBIT,
        maxWidthPx: PRODUCT_PREVIEW_VIDEO_MAX_WIDTH_PX,
        crf: PRODUCT_PREVIEW_VIDEO_CRF,
        dropAudio: true,
        preset: "slower",
      },
    };
  }

  return {
    maxBytes: UPLOAD_VIDEO_MAX_BYTES,
    transcodeOptions: {},
  };
}
