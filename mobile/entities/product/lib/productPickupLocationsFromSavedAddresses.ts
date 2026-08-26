import {
  PRODUCT_PICKUP_LOCATIONS_MAX,
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
