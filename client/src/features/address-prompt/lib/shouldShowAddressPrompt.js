/**
 * @param {{ userAddress?: unknown } | null | undefined} user
 */
export function userHasProfileAddress(user) {
  return String(user?.userAddress ?? "").trim().length > 0;
}

/**
 * @param {{
 *   cookieAccepted: boolean;
 *   isAuthorized: boolean;
 *   hasAddress: boolean;
 *   seenThisSession: boolean;
 *   delayElapsed: boolean;
 *   isCatalogPath: boolean;
 *   blockingUi: boolean;
 * }} input
 */
export function shouldShowAddressPrompt(input) {
  return (
    input.cookieAccepted === true &&
    input.isAuthorized === true &&
    input.hasAddress !== true &&
    input.seenThisSession !== true &&
    input.delayElapsed === true &&
    input.isCatalogPath === true &&
    input.blockingUi !== true
  );
}
