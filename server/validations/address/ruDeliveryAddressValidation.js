import { body } from "express-validator";

import { ADDRESS_LINE_MAX_LENGTH } from "../../constants/dadataConstants.js";
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

  return [
    lineRules,
    body(flatField).optional({ values: "falsy", nullable: true }).trim(),
    body().custom(async (_, { req }) => {
      const lineRaw = req.body[lineField];

      const hasLine = lineRaw !== undefined;
      if (!hasLine) {
        if (lineRequired) {
          throw new Error("Адрес доставки обязателен");
        }
        return true;
      }

      const line =
        lineRaw === null || lineRaw === undefined ? "" : String(lineRaw).trim();

      if (line === "") {
        req.verifiedDeliveryAddress = null;
        return true;
      }

      if (lineRequired && line === "") {
        throw new Error("Адрес доставки обязателен");
      }

      const verified = await verifyRuDeliveryAddress({
        addressLine: line,
        flat: "",
      });
      req.verifiedDeliveryAddress = verified;
      return true;
    }),
  ];
}
