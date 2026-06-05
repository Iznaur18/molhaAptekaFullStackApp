import { body } from "express-validator";

import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
} from "../../constants/dadataConstants.js";
import { verifyRuDeliveryAddress } from "../../utils/dadata/verifyRuDeliveryAddress.js";
/**
 * @param {{
 *   lineField?: string;
 *   flatField?: string;
 *   lineRequired?: boolean;
 * }} [options]
 */
export function ruDeliveryAddressBodyValidation(options = {}) {
  const {
    lineField = "userAddress",
    flatField = "userAddressFlat",
    lineRequired = false,
  } = options;

  const lineRules = lineRequired
    ? body(lineField)
        .isString()
        .withMessage("Адрес должен быть строкой")
        .trim()
        .notEmpty()
        .withMessage("Адрес доставки обязателен")
        .isLength({ max: ADDRESS_LINE_MAX_LENGTH })
        .withMessage(`Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`)
    : body(lineField)
        .optional({ values: "falsy", nullable: true })
        .trim()
        .isLength({ max: ADDRESS_LINE_MAX_LENGTH })
        .withMessage(`Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`);

  const flatRules = lineRequired
    ? body(flatField)
        .isString()
        .withMessage("Квартира должна быть строкой")
        .trim()
        .notEmpty()
        .withMessage("Укажите номер квартиры")
        .isLength({ max: ADDRESS_FLAT_MAX_LENGTH })
        .withMessage(`Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`)
    : body(flatField)
        .optional({ values: "falsy", nullable: true })
        .trim()
        .isLength({ max: ADDRESS_FLAT_MAX_LENGTH })
        .withMessage(`Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`);

  return [
    lineRules,
    flatRules,
    body().custom(async (_, { req }) => {
      const lineRaw = req.body[lineField];
      const flatRaw = req.body[flatField];

      const hasLine = lineRaw !== undefined;
      const hasFlat = flatRaw !== undefined;
      if (!hasLine && !hasFlat) {
        if (lineRequired) {
          throw new Error("Адрес доставки обязателен");
        }
        return true;
      }

      const line =
        lineRaw === null || lineRaw === undefined ? "" : String(lineRaw).trim();
      const flat =
        flatRaw === null || flatRaw === undefined ? "" : String(flatRaw).trim();

      if (line === "" && flat === "") {
        req.verifiedDeliveryAddress = null;
        return true;
      }

      if (lineRequired && line === "") {
        throw new Error("Адрес доставки обязателен");
      }

      if (line === "" && flat !== "") {
        throw new Error("Сначала выберите адрес из подсказок");
      }

      if (line !== "" && flat === "") {
        throw new Error("Укажите номер квартиры");
      }

      const verified = await verifyRuDeliveryAddress({
        addressLine: line,
        flat,
      });
      req.verifiedDeliveryAddress = verified;
      return true;
    }),
  ];
}
