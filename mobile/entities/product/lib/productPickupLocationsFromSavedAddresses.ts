import {
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_LOCATIONS_MAX,
  PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH,
  productPickupLocationDuplicateKey,
} from "@molha/api-contract";

/** Точка самовывоза в том виде, в каком её принимает контракт. */
export type ProductPickupLocationValue = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lon: number;
  isDefault: boolean;
};

type SavedAddressLike = {
  id?: string;
  label?: string;
  line?: string;
  flat?: string;
  geo?: { lat?: unknown; lon?: unknown } | null;
};

/**
 * Адрес из книги профиля годится в точку самовывоза только с координатами:
 * `productPickupLocationItemSchema` требует lat/lon, они не optional. Адрес,
 * набранный руками без выбора из подсказок, координат не имеет — такой в
 * список точек не превратить, и выбирать его нельзя.
 */
export const canUseSavedAddressAsPickupLocation = (
  address: SavedAddressLike | null | undefined,
): boolean => {
  const lat = Number(address?.geo?.lat);
  const lon = Number(address?.geo?.lon);
  return (
    String(address?.line ?? "").trim().length > 0 &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  );
};

export const pickupLocationFromSavedAddress = (
  address: SavedAddressLike,
  isDefault: boolean,
): ProductPickupLocationValue => ({
  id: String(address.id ?? "").trim(),
  label: String(address.label ?? "").trim(),
  address: String(address.line ?? "").trim(),
  lat: Number(address.geo?.lat),
  lon: Number(address.geo?.lon),
  isDefault,
});

/**
 * Отмеченные в книге адреса → список точек. Порядок берём из книги, чтобы
 * галочки и список совпадали; первая точка становится основной, если ни одна
 * не помечена. Дубли по адресу отбрасываем — их запрещает контракт.
 */
export const pickupLocationsFromSelectedAddresses = (
  addresses: SavedAddressLike[],
  selectedIds: readonly string[],
  previousDefaultId?: string | null,
): ProductPickupLocationValue[] => {
  const selected = new Set(selectedIds.map((id) => String(id)));
  const seenAddressKeys = new Set<string>();
  const result: ProductPickupLocationValue[] = [];

  for (const address of addresses) {
    const id = String(address.id ?? "");
    if (!selected.has(id) || !canUseSavedAddressAsPickupLocation(address)) {
      continue;
    }
    const key = productPickupLocationDuplicateKey(String(address.line ?? ""));
    if (seenAddressKeys.has(key)) {
      continue;
    }
    seenAddressKeys.add(key);
    result.push(pickupLocationFromSavedAddress(address, false));
    if (result.length >= PRODUCT_PICKUP_LOCATIONS_MAX) {
      break;
    }
  }

  if (result.length === 0) {
    return result;
  }

  const defaultIndex = result.findIndex((item) => item.id === String(previousDefaultId ?? ""));
  const targetIndex = defaultIndex >= 0 ? defaultIndex : 0;
  return result.map((item, index) => ({ ...item, isDefault: index === targetIndex }));
};

/**
 * Приводит произвольный набор точек к тому, что примет контракт: не больше
 * лимита и ровно одна основная. Если прежняя основная в наборе осталась —
 * она ею и остаётся, иначе основной становится первая.
 */
export const normalizePickupLocations = (
  points: readonly ProductPickupLocationValue[],
  previousDefaultId?: string | null,
): ProductPickupLocationValue[] => {
  const limited = points.slice(0, PRODUCT_PICKUP_LOCATIONS_MAX);
  if (limited.length === 0) {
    return [];
  }
  const defaultIndex = limited.findIndex(
    (item) => item.id === String(previousDefaultId ?? ""),
  );
  const targetIndex = defaultIndex >= 0 ? defaultIndex : 0;
  return limited.map((item, index) => ({ ...item, isDefault: index === targetIndex }));
};

/**
 * Точки, заведённые руками (их id нет в книге). Их нельзя терять, когда
 * продавец снимает или ставит галочку на адресе книги.
 */
export const manualPickupLocations = (
  points: readonly ProductPickupLocationValue[],
  addresses: readonly SavedAddressLike[],
): ProductPickupLocationValue[] => {
  const bookIds = new Set(addresses.map((item) => String(item.id ?? "")));
  return points.filter((item) => !bookIds.has(item.id));
};

/**
 * Можно ли добавить набранный в поле адрес отдельной точкой: есть текст и
 * координаты, лимит не выбран, такого адреса ещё нет.
 */
export const canAddPickupLocationAddress = (
  points: readonly ProductPickupLocationValue[],
  address: string,
  lat: number | null | undefined,
  lon: number | null | undefined,
): boolean => {
  const line = String(address ?? "").trim();
  if (line.length === 0 || points.length >= PRODUCT_PICKUP_LOCATIONS_MAX) {
    return false;
  }
  // `Number(null)` — это 0, поэтому пустые координаты отсекаем до приведения:
  // адрес, набранный руками без подсказки, координат не имеет.
  if (lat == null || lon == null) {
    return false;
  }
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
    return false;
  }
  const key = productPickupLocationDuplicateKey(line);
  return !points.some((item) => productPickupLocationDuplicateKey(item.address) === key);
};

/**
 * Проверка списка точек по правилам контракта — те же, что в вебе
 * (`validateProductPickupLocationsForm`).
 *
 * Пустой список НЕ ошибка: мобилка, в отличие от веба, держит обязательным
 * легаси-поле «адрес продажи», а сервер сам заворачивает его в единственную
 * точку (`resolveProductPickupWriteFields`). Поэтому эффективный список
 * никогда не пуст, и `PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE` остаётся
 * серверным guard'ом.
 */
export const validateProductPickupLocationsList = (
  points: readonly ProductPickupLocationValue[],
): string | null => {
  const list = Array.isArray(points) ? points : [];
  if (list.length === 0) {
    return null;
  }
  if (list.length > PRODUCT_PICKUP_LOCATIONS_MAX) {
    return `Не больше ${PRODUCT_PICKUP_LOCATIONS_MAX} точек самовывоза`;
  }
  if (list.filter((item) => item.isDefault).length !== 1) {
    return PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE;
  }

  const keys = new Set<string>();
  for (const item of list) {
    if (String(item.label ?? "").trim().length > PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH) {
      return `Метка не длиннее ${PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH} символов`;
    }
    const address = String(item.address ?? "").trim();
    if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
      return PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE;
    }
    if (
      item.lat == null ||
      item.lon == null ||
      !Number.isFinite(Number(item.lat)) ||
      !Number.isFinite(Number(item.lon))
    ) {
      return PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE;
    }
    const key = productPickupLocationDuplicateKey(address);
    if (keys.has(key)) {
      return "Такой адрес уже добавлен";
    }
    keys.add(key);
  }

  return null;
};

/**
 * Есть ли набранный в поле адрес среди точек. Когда список непустой, сервер
 * (`resolveProductPickupWriteFields`) собирает легаси-поля товара из основной
 * точки, а набранный отдельно адрес никуда не попадает — поэтому его либо
 * добавляют точкой, либо поле чистят.
 */
export const isPickupAddressAmongLocations = (
  address: string,
  points: readonly ProductPickupLocationValue[],
): boolean => {
  const key = productPickupLocationDuplicateKey(address);
  if (!key) {
    return false;
  }
  return points.some((item) => productPickupLocationDuplicateKey(item.address) === key);
};
