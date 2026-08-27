const toFiniteCoord = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

export type ProductModerationOriginPoint = {
  address: string;
  lat: number | null;
  lon: number | null;
  coordsText: string | null;
};

/**
 * Точка отправления товара для модератора.
 *
 * Показывается ТОЛЬКО когда самовывоз выключен — ровно как в вебе
 * (`ProductModerationCreateDetailsModal`: `mapsUrl && !pickup.enabled`).
 * При включённом самовывозе адрес и так виден покупателю на карточке, а вот
 * у товара «только доставка» склад продавца больше нигде не показывается —
 * и без него модератору нечего проверять.
 *
 * Покупателю это отдавать нельзя: адрес склада не публичный, поэтому блок
 * живёт в карточке очереди модерации, а не в `ProductPickupDetailsPanel`.
 */
export const resolveProductModerationOriginPoint = (
  product: Record<string, unknown> | null | undefined,
  formatCoords: (lat: number, lon: number) => string,
): ProductModerationOriginPoint | null => {
  if (product == null) {
    return null;
  }
  if (product.productPickupEnabled !== false) {
    return null;
  }

  const address = String(product.productPickupAddress ?? "").trim();
  const lat = toFiniteCoord(product.productPickupLat);
  const lon = toFiniteCoord(product.productPickupLon);

  // Ни адреса, ни координат — открывать на карте нечего.
  if (!address && (lat == null || lon == null)) {
    return null;
  }

  return {
    address,
    lat,
    lon,
    coordsText: lat != null && lon != null ? formatCoords(lat, lon) : null,
  };
};
