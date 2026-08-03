/**
 * Есть ли у пользователя координаты адреса для каталога «Рядом».
 * Паритет с `client/.../userHasCatalogNearGeo.js`.
 */
export function userHasCatalogNearGeo(
  user: { userAddressGeo?: { lat?: unknown; lon?: unknown } | null } | null | undefined,
): boolean {
  const lat = Number(user?.userAddressGeo?.lat);
  const lon = Number(user?.userAddressGeo?.lon);
  return (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}
