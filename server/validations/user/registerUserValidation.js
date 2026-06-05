import { body } from "express-validator";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";
import { assertRuPhoneFormat, normalizeRuPhoneInput } from "./ruPhoneRules.js";
import { assertUserNameFormat, normalizeUserNameInput } from "./userNameRules.js";
import { ruDeliveryAddressBodyValidation } from "../address/ruDeliveryAddressValidation.js";
import { isUserBackgroundPresetId } from "../../constants/userBackgroundPresets.js";

const USER_GENDER_VALUES = ["male", "female", "noSelected"];

export const registerUserValidation = [
  body("email").isEmail().withMessage("Неверный email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен быть не менее 6 символов"),

  body("passwordConfirm")
    .exists({ checkFalsy: true })
    .withMessage("Повторите пароль")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Пароли не совпадают");
      }
      return true;
    }),

  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Никнейм обязателен")
    .customSanitizer((value) => normalizeUserNameInput(value) ?? "")
    .custom((value) => {
      try {
        assertUserNameFormat(value);
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : "Неверный никнейм");
      }
      return true;
    }),

  body("phoneNumber")
    .optional({ values: "falsy" })
    .trim()
    .customSanitizer((value) => normalizeRuPhoneInput(value))
    .custom((value) => {
      if (value === undefined) return true;
      try {
        assertRuPhoneFormat(value);
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : "Неверный номер телефона");
      }
      return true;
    }),

  body("avatarUrl")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("URL аватара должен быть валидным URL"),

  body("backgroundPresetId")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value == null || String(value).trim() === "") return true;
      if (!isUserBackgroundPresetId(String(value).trim())) {
        throw new Error("Некорректный пресет фона");
      }
      return true;
    }),

  body("userBirthDate")
    .optional({ values: "falsy" })
    .isISO8601({ strict: false })
    .withMessage("Неверная дата рождения"),

  body("userGender")
    .optional({ values: "falsy" })
    .isIn(USER_GENDER_VALUES)
    .withMessage("Неверное значение пола"),

  ...ruDeliveryAddressBodyValidation(),

  body("notificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("notificationsEnabled должен быть boolean"),

  handleValidationByExpressErrors,
];
