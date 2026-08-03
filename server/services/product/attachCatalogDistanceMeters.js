/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} meters
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6_378_100 * c;
}

/**
 * @param {unknown} product
 * @returns {{ lat: number; lon: number } | null}
 */
export function pickProductPickupPoint(product) {
  if (!product || typeof product !== "object") {
    return null;
  }
  const row = /** @type {Record<string, unknown>} */ (product);
  const lat = Number(row.productPickupLat);
  const lon = Number(row.productPickupLon);
  if (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  ) {
    return { lat, lon };
  }

  const loc = row.productPickupLocation;
  if (loc && typeof loc === "object") {
    const coords = /** @type {{ coordinates?: unknown }} */ (loc).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      const geoLon = Number(coords[0]);
      const geoLat = Number(coords[1]);
      if (
        Number.isFinite(geoLat) &&
        geoLat >= -90 &&
        geoLat <= 90 &&
        Number.isFinite(geoLon) &&
        geoLon >= -180 &&
        geoLon <= 180
      ) {
        return { lat: geoLat, lon: geoLon };
      }
    }
  }

  return null;
}

/**
 * Вешает `distanceMeters` на товары с точкой самовывоза (без фильтра по радиусу).
 * Товары без точки / без viewer geo — без поля.
 *
 * @template {Record<string, unknown>} T
 * @param {T[]} products
 * @param {{ lat: number; lon: number } | null | undefined} viewerGeo
 * @returns {T[]}
 */
export function attachCatalogDistanceMeters(products, viewerGeo) {
  if (!Array.isArray(products) || products.length === 0) {
    return products;
  }
  const viewerLat = Number(viewerGeo?.lat);
  const viewerLon = Number(viewerGeo?.lon);
  if (
    !Number.isFinite(viewerLat) ||
    viewerLat < -90 ||
    viewerLat > 90 ||
    !Number.isFinite(viewerLon) ||
    viewerLon < -180 ||
    viewerLon > 180
  ) {
    return products;
  }

  return products.map((product) => {
    if (
      product &&
      typeof product === "object" &&
      Object.prototype.hasOwnProperty.call(product, "distanceMeters") &&
      Number.isFinite(Number(/** @type {{ distanceMeters?: unknown }} */ (product).distanceMeters))
    ) {
      return product;
    }
    const point = pickProductPickupPoint(product);
    if (!point) {
      return product;
    }
    const distanceMeters = haversineDistanceMeters(
      viewerLat,
      viewerLon,
      point.lat,
      point.lon,
    );
    return { ...product, distanceMeters };
  });
}
