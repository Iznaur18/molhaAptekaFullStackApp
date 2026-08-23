/**
 * @param {{
 *   id: string;
 *   label?: string;
 *   displayAddress: string;
 *   flat?: string;
 *   city?: string;
 *   district?: string;
 *   street?: string;
 *   house?: string;
 *   fiasId?: string;
 *   geo?: { lat: number; lon: number } | null;
 *   isDefault?: boolean;
 * }} item
 */
export function mapVerifiedUserSavedAddressItem(item) {
  return {
    id: item.id,
    label: item.label ?? "",
    line: item.displayAddress,
    flat: item.flat ?? "",
    city: item.city ?? "",
    district: item.district ?? "",
    street: item.street ?? "",
    house: item.house ?? "",
    fiasId: item.fiasId ?? "",
    geo: item.geo ?? null,
    isDefault: item.isDefault === true,
  };
}

/**
 * @param {Record<string, unknown>} stored
 */
export function mapStoredUserSavedAddressItem(stored) {
  return {
    id: String(stored?.id ?? "").trim() || "legacy-default",
    label: String(stored?.label ?? "").trim(),
    line: String(stored?.line ?? "").trim(),
    flat: String(stored?.flat ?? "").trim(),
    city: String(stored?.city ?? "").trim(),
    district: String(stored?.district ?? "").trim(),
    street: String(stored?.street ?? "").trim(),
    house: String(stored?.house ?? "").trim(),
    fiasId: String(stored?.fiasId ?? "").trim(),
    geo: stored?.geo ?? null,
    isDefault: stored?.isDefault === true,
  };
}

/**
 * @param {import("../utils/dadata/verifyRuDeliveryAddress.js").verifyRuDeliveryAddress extends (...args: any[]) => Promise<infer R> ? R : never} verified
 * @param {{ id?: string; label?: string; isDefault?: boolean }} [meta]
 */
export function mapLegacyVerifiedDeliveryAddress(verified, meta = {}) {
  return mapVerifiedUserSavedAddressItem({
    id: meta.id ?? "legacy-default",
    label: meta.label ?? "",
    displayAddress: verified.displayAddress,
    flat: verified.flat,
    city: verified.city,
    district: verified.district,
    street: verified.street,
    house: verified.house,
    fiasId: verified.fiasId,
    geo: verified.geo,
    isDefault: meta.isDefault ?? true,
  });
}

/**
 * Legacy PATCH (`userAddress`) синхронизирует массив `userAddresses`:
 * - null → очистка;
 * - один адрес → replace/single;
 * - несколько → обновляем только default.
 *
 * @param {Array<Record<string, unknown>>} existingAddresses
 * @param {Awaited<ReturnType<import("../utils/dadata/verifyRuDeliveryAddress.js").verifyRuDeliveryAddress>>} verified
 */
export function buildLegacyVerifiedUserAddresses(existingAddresses, verified) {
  const stored = existingAddresses.map(mapStoredUserSavedAddressItem).filter((item) => item.line);

  if (stored.length > 1) {
    const defaultIndex = Math.max(
      0,
      stored.findIndex((item) => item.isDefault),
    );

    return stored.map((item, index) => {
      if (index !== defaultIndex) {
        return item;
      }

      return mapLegacyVerifiedDeliveryAddress(verified, {
        id: item.id,
        label: item.label,
        isDefault: true,
      });
    });
  }

  if (stored.length === 1) {
    return [
      mapLegacyVerifiedDeliveryAddress(verified, {
        id: stored[0].id,
        label: stored[0].label,
        isDefault: true,
      }),
    ];
  }

  return [mapLegacyVerifiedDeliveryAddress(verified)];
}

/**
 * Legacy PATCH `userAddress: null` — при нескольких адресах убираем только default,
 * остальные сохраняем. Полная очистка только если адрес был один или списка не было.
 *
 * @param {Array<Record<string, unknown>>} existingAddresses
 */
export function buildLegacyClearUserAddresses(existingAddresses) {
  const stored = existingAddresses.map(mapStoredUserSavedAddressItem).filter((item) => item.line);

  if (stored.length <= 1) {
    return [];
  }

  const defaultIndex = Math.max(
    0,
    stored.findIndex((item) => item.isDefault),
  );
  const remaining = stored.filter((_, index) => index !== defaultIndex);

  if (remaining.length === 0) {
    return [];
  }

  if (remaining.some((item) => item.isDefault)) {
    return remaining;
  }

  return remaining.map((item, index) => ({
    ...item,
    isDefault: index === 0,
  }));
}
