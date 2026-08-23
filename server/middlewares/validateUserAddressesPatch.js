import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";
import { errorRes } from "../services/http/index.js";

/**
 * DaData-проверка массива адресов профиля после Zod.
 */
export function validateUserAddressesPatch() {
  return async (req, res, next) => {
    try {
      if (req.body.userAddresses === undefined) {
        return next();
      }

      const items = Array.isArray(req.body.userAddresses) ? req.body.userAddresses : [];

      if (items.length === 0) {
        req.verifiedUserAddresses = [];
        return next();
      }

      /** @type {Array<Record<string, unknown>>} */
      const verifiedAddresses = [];

      for (const item of items) {
        const verified = await verifyRuDeliveryAddress({
          addressLine: item.line,
          flat: item.flat ?? "",
        });

        verifiedAddresses.push({
          id: String(item.id ?? "").trim(),
          label: String(item.label ?? "").trim(),
          line: verified.displayAddress,
          flat: verified.flat ?? "",
          city: verified.city ?? "",
          district: verified.district ?? "",
          street: verified.street ?? "",
          house: verified.house ?? "",
          fiasId: verified.fiasId ?? "",
          geo: verified.geo ?? null,
          isDefault: item.isDefault === true,
        });
      }

      req.verifiedUserAddresses = verifiedAddresses;
      return next();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Некорректный адрес доставки";
      return errorRes(res, 400, message);
    }
  };
}
