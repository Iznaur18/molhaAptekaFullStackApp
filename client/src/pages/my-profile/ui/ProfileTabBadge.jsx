import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ count?: number }} props
 */
export function ProfileTabBadge({ count = 0 }) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span className="my-profile-page__badge" aria-hidden="true">
      {MY_PROFILE_PAGE_UI.TAB_BADGE(count)}
    </span>
  );
}
