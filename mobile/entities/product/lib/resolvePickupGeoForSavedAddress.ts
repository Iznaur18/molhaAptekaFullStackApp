import { pickAddressSuggestionForGeo } from "@molha/api-contract";

import { fetchAddressSuggestions } from "@/entities/address/api/fetchAddressSuggestions";
import { mapDadataSuggestion } from "@/entities/address/lib/mapDadataSuggestion";
import { ADDRESS_SUGGEST_MIN_QUERY_LENGTH } from "@/entities/address/model/constants";

type SavedAddressLike = {
  line?: string;
  geo?: { lat?: unknown; lon?: unknown } | null;
};

export const hasValidPickupGeo = (
  geo: { lat?: unknown; lon?: unknown } | null | undefined,
): boolean => {
  const lat = Number(geo?.lat);
  const lon = Number(geo?.lon);
  return (
    geo?.lat != null &&
    geo?.lon != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  );
};

/**
 * Координаты для адреса книги, у которого их нет.
 *
 * Контракт требует lat/lon у каждой точки самовывоза, но в книге профиля
 * координаты есть не у всех адресов: легаси-geo подставляется только основному
 * (`userSavedAddressesFromUser`), а адрес, набранный без выбора из подсказки,
 * их не получает вовсе. Веб в такой ситуации не блокирует адрес, а тихо
 * догеокодирует его по строке — здесь то же самое, иначе продавец на телефоне
 * не может выбрать точкой половину собственной книги.
 *
 * Ошибки и пустой ответ подсказок отдаём как `null`: адрес просто останется
 * без координат, и его отсеет валидация шага.
 */
export const resolvePickupGeoForSavedAddress = async (
  saved: SavedAddressLike | null | undefined,
): Promise<{ lat: number; lon: number } | null> => {
  if (hasValidPickupGeo(saved?.geo)) {
    return { lat: Number(saved?.geo?.lat), lon: Number(saved?.geo?.lon) };
  }

  const line = String(saved?.line ?? "").trim();
  if (line.length < ADDRESS_SUGGEST_MIN_QUERY_LENGTH) {
    return null;
  }

  try {
    const suggestions = await fetchAddressSuggestions(line);
    const pick = pickAddressSuggestionForGeo(suggestions);
    if (!pick) {
      return null;
    }
    const mapped = mapDadataSuggestion(pick);
    if (!hasValidPickupGeo(mapped.geo)) {
      return null;
    }
    return { lat: Number(mapped.geo?.lat), lon: Number(mapped.geo?.lon) };
  } catch {
    return null;
  }
};
