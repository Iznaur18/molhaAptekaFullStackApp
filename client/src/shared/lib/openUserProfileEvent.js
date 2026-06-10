export const OPEN_USER_PROFILE_EVENT = "app:open-user-profile";

/**
 * @param {string} userId
 */
export function dispatchOpenUserProfileEvent(userId) {
  window.dispatchEvent(
    new CustomEvent(OPEN_USER_PROFILE_EVENT, {
      detail: { userId: String(userId) },
    }),
  );
}
