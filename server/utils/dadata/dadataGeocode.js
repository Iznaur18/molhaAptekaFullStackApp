import { dadataSuggestionGeo } from "@molha/api-contract";

import {
  GEO_PRECISION_HOUSE,
  GEO_PRECISION_SETTLEMENT,
  GEO_PRECISION_STREET,
} from "../../constants/geoRoutingConstants.js";
import { buildCoarseAddressQueries } from "../../services/shipping/geo/addressQueries.js";

import { isDadataSuggestConfigured, suggestRuAddresses } from "./dadataClient.js";

/**
 * Точность координат по коду `qc_geo` DaData.
 *
 * 0 — точный дом, 1 — ближайший дом, 2 — улица, 3 — населённый пункт,
 * 4 — город, 5 — координат нет.
 *
 * @param {unknown} qcGeo
 * @returns {string | null}
 */
export function dadataQcGeoPrecision(qcGeo) {
  if (qcGeo === null || qcGeo === undefined || qcGeo === "") {
    return null;
  }
  const code = Number(qcGeo);
  if (code === 0 || code === 1) return GEO_PRECISION_HOUSE;
  if (code === 2) return GEO_PRECISION_STREET;
  if (code === 3 || code === 4) return GEO_PRECISION_SETTLEMENT;
  return null;
}

/**
 * Координаты по усечённому адресу — улица или город.
 *
 * Полный адрес уже проверила `verifyRuDeliveryAddress`, и если координат там
 * не нашлось, дальше помогает только грубая точка: DaData знает сокращения
 * ФИАС и не спотыкается на «г» и «ул», поэтому идёт первой.
 *
 * @param {string} line
 * @returns {Promise<{ point: { lat: number; lon: number }; precision: string; provider: string } | null>}
 */
export async function geocodeCoarseWithDadata(line) {
  if (!isDadataSuggestConfigured()) {
    return null;
  }
  for (const query of buildCoarseAddressQueries(line)) {
    let suggestions;
    try {
      suggestions = await suggestRuAddresses(query);
    } catch {
      return null;
    }
    for (const suggestion of Array.isArray(suggestions) ? suggestions : []) {
      const point = dadataSuggestionGeo(suggestion?.data);
      const precision = dadataQcGeoPrecision(suggestion?.data?.qc_geo);
      if (point && precision) {
        return { point, precision, provider: "dadata" };
      }
    }
  }
  return null;
}
