import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";
import { errorRes } from "../utils/index.js";

/**
 * DaData-проверка адреса доставки после Zod-структуры тела.
 * @param {{
 *   lineField?: string;
 *   flatField?: string;
 *   lineRequired?: boolean;
 * }} [options]
 */
export function validateRuDeliveryAddress(options = {}) {
  const { lineField = "userAddress", lineRequired = false } = options;

  return async (req, res, next) => {
    try {
      const lineRaw = req.body[lineField];
      const hasLine = lineRaw !== undefined;

      if (!hasLine) {
        if (lineRequired) {
          return errorRes(res, 400, "Адрес доставки обязателен");
        }
        return next();
      }

      const line =
        lineRaw === null || lineRaw === undefined ? "" : String(lineRaw).trim();

      if (line === "") {
        req.verifiedDeliveryAddress = null;
        return next();
      }

      if (lineRequired && line === "") {
        return errorRes(res, 400, "Адрес доставки обязателен");
      }

      const verified = await verifyRuDeliveryAddress({
        addressLine: line,
        flat: "",
      });
      req.verifiedDeliveryAddress = verified;
      return next();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Некорректный адрес доставки";
      return errorRes(res, 400, message);
    }
  };
}
