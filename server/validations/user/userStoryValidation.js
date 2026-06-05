import { body, param } from "express-validator";

import { PRODUCT_REPORT_TEXT_MAX_CHARS } from "../../constants/productReportConstants.js";
import {
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPES,
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
} from "../../constants/userStoryConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const userStoryIdParamValidation = [
  param("storyId").isMongoId().withMessage("Некорректный id сториса"),
  handleValidationByExpressErrors,
];

export const createUserStoryValidation = [
  body("mediaType")
    .isString()
    .trim()
    .isIn(USER_STORY_MEDIA_TYPES)
    .withMessage("Укажите тип медиа: image или video"),
  body("mediaUrl").isString().trim().notEmpty().withMessage("Укажите URL медиа"),
  body("captionText")
    .optional()
    .isString()
    .trim()
    .isLength({ max: USER_STORY_CAPTION_MAX_CHARS })
    .withMessage(`Текст сторис: не больше ${USER_STORY_CAPTION_MAX_CHARS} символов`),
  handleValidationByExpressErrors,
];

export const submitUserStoryReportValidation = [
  body("reportText")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Укажите текст жалобы")
    .isLength({ max: PRODUCT_REPORT_TEXT_MAX_CHARS })
    .withMessage(`Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`),
  handleValidationByExpressErrors,
];

export const resolveUserStoryReportsValidation = [
  body("resolution")
    .isString()
    .trim()
    .isIn([USER_STORY_REPORT_RESOLUTION_DISMISS, USER_STORY_REPORT_RESOLUTION_HIDE])
    .withMessage("Недопустимое действие"),
  body("staffNote")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Комментарий staff обязателен")
    .isLength({ max: 2000 })
    .withMessage("Комментарий staff: не больше 2000 символов"),
  handleValidationByExpressErrors,
];
