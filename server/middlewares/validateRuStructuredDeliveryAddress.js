import { buildAddressLineFromStructured } from "@molha/api-contract";

import { verifyRuDeliveryAddress } from "../utils/dadata/verifyRuDeliveryAddress.js";
import { errorRes } from "../services/http/index.js";
import { validateRuDeliveryAddress } from "./validateRuDeliveryAddress.js";

/** Только city/street/house/district — `userAddressFlat` приходит и с line-адресом. */
const STRUCTURED_ADDRESS_FIELDS = [
  "userAddressCity",
  "userAddressDistrict",
  "userAddressStreet",
  "userAddressHouse",
];

/**
 * @param {unknown} raw
 */
function trimField(raw) {
  if (raw === null || raw === undefined) return "";
  return String(raw).trim();
}

/**
 * Порядок строк-кандидатов на проверку в DaData.
 *
 * Каноническая строка, которую клиент получил из подсказки, точнее пересборки
 * из частей: пересборка всегда пишет «д {house}» и теряет тип объекта —
 * «уч 51» превращается в «д 51», и DaData такой адрес уже не узнаёт (а значит
 * не отдаёт координаты). Пересборку оставляем запасным вариантом: она нужна,
 * когда клиент прислал только части.
 *
 * @param {{ rawLine: string; structuredLine: string }} params
 * @returns {string[]}
 */
export function buildAddressCandidates({ rawLine, structuredLine }) {
  const candidates = [];
  if (rawLine) candidates.push(rawLine);
  if (structuredLine && structuredLine !== rawLine) {
    candidates.push(structuredLine);
  }
  return candidates;
}

/**
 * Проверяет кандидатов по очереди и берёт первого, у кого есть координаты.
 *
 * @param {{ rawLine: string; structuredLine: string; flat: string }} params
 */
async function verifyStructuredAddressCandidates({
  rawLine,
  structuredLine,
  flat,
}) {
  const candidates = buildAddressCandidates({ rawLine, structuredLine });

  let fallback = null;
  let lastError = null;

  for (const addressLine of candidates) {
    try {
      const attempt = await verifyRuDeliveryAddress({ addressLine, flat });
      if (attempt.geo) return attempt;
      fallback ??= attempt;
    } catch (error) {
      lastError = error;
    }
  }

  if (fallback) return fallback;
  throw lastError ?? new Error("Некорректный адрес доставки");
}

/**
 * DaData-проверка структурированного адреса профиля.
 */
export function validateRuStructuredDeliveryAddress() {
  const legacyMiddleware = validateRuDeliveryAddress();

  return async (req, res, next) => {
    try {
      if (req.body.userAddresses !== undefined) {
        return next();
      }

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

      const verified = await verifyStructuredAddressCandidates({
        rawLine: trimField(req.body.userAddress),
        structuredLine: buildAddressLineFromStructured({
          city,
          district,
          street,
          house,
        }),
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
