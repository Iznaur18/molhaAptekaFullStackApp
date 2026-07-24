/** Паритет с mobile `homeCatalogHeaderLayout` stretch-menu. */

export const HEADER_USERS_STRETCH_BUTTON_SIZE_PX = 44;
export const HEADER_USERS_STRETCH_TOGGLE_GAP_PX = 12;
export const HEADER_USERS_STRETCH_ITEM_GAP_PX = 8;
export const HEADER_USERS_STRETCH_BOTTOM_PAD_PX = 8;
export const HEADER_USERS_STRETCH_ANIM_MS = 220;
export const HEADER_USERS_STRETCH_ICON_SIZE_PX = 22;

/**
 * @param {number} itemCount
 * @returns {number}
 */
export function resolveHeaderUsersStretchMenuHeight(itemCount) {
  if (itemCount <= 0) {
    return HEADER_USERS_STRETCH_BUTTON_SIZE_PX;
  }

  return (
    HEADER_USERS_STRETCH_BUTTON_SIZE_PX +
    HEADER_USERS_STRETCH_TOGGLE_GAP_PX +
    itemCount * HEADER_USERS_STRETCH_BUTTON_SIZE_PX +
    Math.max(0, itemCount - 1) * HEADER_USERS_STRETCH_ITEM_GAP_PX +
    HEADER_USERS_STRETCH_BOTTOM_PAD_PX
  );
}
