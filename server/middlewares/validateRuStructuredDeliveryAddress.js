import { buildAddressLineFromStructured } from "@molha/api-contract";

import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";
import { errorRes } from "../services/http/index.js";
import { validateRuDeliveryAddress } from "./validateRuDeliveryAddress.js";

const STRUCTURED_ADDRESS_FIELDS = [
  "userAddressCity",
  "userAddressDistrict",
  "userAddressStreet",
  "userAddressHouse",
  "userAddressFlat",
];

/**
 * @param {unknown} raw
 */
function trimField(raw) {
  if (raw === null || raw === undefined) return "";
  return String(raw).trim();
}

/**
 * DaData-проверка структурированного адреса профиля.
 */
export function validateRuStructuredDeliveryAddress() {
  const legacyMiddleware = validateRuDeliveryAddress();

  return async (req, res, next) => {
    try {
      const hasStructured = STRUCTURED_ADDRESS_FIELDS.some(
        (field) => req.body[field] !== undefined,
      );

      if (!hasStructured) {
        if (req.body.userAddress !== undefined) {
          return legacyMiddleware(req, res, next);
        }
        return next();
      }

      const city = trimField(req.body.userAddressCity);
      const district = trimField(req.body.userAddressDistrict);
      const street = trimField(req.body.userAddressStreet);
      const house = trimField(req.body.userAddressHouse);
      const flat = trimField(req.body.userAddressFlat);
      const allEmpty = !city && !district && !street && !house && !flat;

      if (allEmpty) {
        req.verifiedDeliveryAddress = null;
        return next();
      }

      if (!city || !street || !house) {
        return errorRes(res, 400, "Укажите город, улицу и номер дома");
      }

      const addressLine = buildAddressLineFromStructured({
        city,
        district,
        street,
        house,
      });

      const verified = await verifyRuDeliveryAddress({
        addressLine,
        flat,
      });

      req.verifiedDeliveryAddress = {
        ...verified,
        city: verified.city || city,
        district: verified.district || district,
        street: verified.street || street,
        house: verified.house || house,
      };

      return next();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Некорректный адрес доставки";
      return errorRes(res, 400, message);
    }
  };
}
