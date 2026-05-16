import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
  DADATA_QC_COMPLETE_MAX,
  DADATA_QC_GEO_MAX,
} from '../../constants/dadataConstants.js';
import { cleanRuAddress, isDadataConfigured } from './dadataClient.js';

/**
 * @param {string} line
 * @param {string} flat
 */
export function buildAddressQueryForClean(line, flat) {
  const base = String(line).trim();
  const apartment = String(flat).trim();
  if (!apartment) return base;
  return `${base}, кв ${apartment}`;
}

/**
 * @param {Record<string, unknown>} cleaned
 * @returns {string | null}
 */
function pickFlatFromCleaned(cleaned) {
  const flat = cleaned.flat;
  if (flat == null) return null;
  const text = String(flat).trim();
  return text === '' ? null : text;
}

/**
 * @param {{ addressLine: string; flat: string }} params
 * @returns {Promise<{
 *   displayAddress: string;
 *   flat: string;
 *   fiasId: string;
 *   geo: { lat: number; lon: number } | null;
 * }>}
 */
export async function verifyRuDeliveryAddress({ addressLine, flat }) {
  if (!isDadataConfigured()) {
    throw new Error(
      'Проверка адресов не настроена (DADATA_API_KEY, DADATA_SECRET_KEY)',
    );
  }

  const line = String(addressLine ?? '').trim();
  const flatInput = String(flat ?? '').trim();

  if (line.length === 0) {
    throw new Error('Укажите адрес из подсказок');
  }
  if (line.length > ADDRESS_LINE_MAX_LENGTH) {
    throw new Error(`Адрес не длиннее ${ADDRESS_LINE_MAX_LENGTH} символов`);
  }
  if (flatInput.length === 0) {
    throw new Error('Укажите номер квартиры');
  }
  if (flatInput.length > ADDRESS_FLAT_MAX_LENGTH) {
    throw new Error(`Квартира: не более ${ADDRESS_FLAT_MAX_LENGTH} символов`);
  }

  const cleaned = await cleanRuAddress(buildAddressQueryForClean(line, flatInput));
  const cleanedFlat = pickFlatFromCleaned(cleaned);

  if (!cleanedFlat) {
    throw new Error('Укажите номер квартиры для доставки');
  }

  const qcComplete = Number(cleaned.qc_complete ?? 10);
  if (Number.isNaN(qcComplete) || qcComplete > DADATA_QC_COMPLETE_MAX) {
    throw new Error('Адрес неполный — выберите вариант из подсказок DaData');
  }

  const qcGeo = Number(cleaned.qc_geo ?? 10);
  if (Number.isNaN(qcGeo) || qcGeo > DADATA_QC_GEO_MAX) {
    throw new Error('Уточните адрес до дома (улица и номер дома)');
  }

  const fiasIdRaw = cleaned.house_fias_id ?? cleaned.fias_id;
  const fiasId = fiasIdRaw != null ? String(fiasIdRaw).trim() : '';
  if (!fiasId) {
    throw new Error('Не удалось определить дом по адресу');
  }

  const displayAddress =
    typeof cleaned.result === 'string' && cleaned.result.trim() !== ''
      ? cleaned.result.trim()
      : buildAddressQueryForClean(line, cleanedFlat);

  const lat = Number(cleaned.geo_lat);
  const lon = Number(cleaned.geo_lon);
  const geo =
    Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;

  return {
    displayAddress,
    flat: cleanedFlat,
    fiasId,
    geo,
  };
}
