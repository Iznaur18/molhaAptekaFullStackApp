import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import("../ui/ProfileSidebar.jsx").ProfileNavGroup[]} groups
 * @param {string} activeTab
 * @returns {string}
 */
export function getActiveProfileNavLabel(groups, activeTab) {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.tab === activeTab) {
        return item.label;
      }
    }
  }

  return MY_PROFILE_PAGE_UI.TAB_OVERVIEW;
}
