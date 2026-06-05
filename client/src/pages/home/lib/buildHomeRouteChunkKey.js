/**
 * @param {{
 *   mainView: string;
 *   activeProfileTab: string;
 *   sellerRouteId?: string | null;
 *   raffleRouteId?: string | null;
 * }} params
 */
export function buildHomeRouteChunkKey({
  mainView,
  activeProfileTab,
  sellerRouteId,
  raffleRouteId,
}) {
  return [mainView, activeProfileTab, sellerRouteId ?? "", raffleRouteId ?? ""].join(
    "|",
  );
}
