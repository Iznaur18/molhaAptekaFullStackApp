import { USER_DETAILS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./UserDetailsPageSkeleton.css";

/**
 * Плейсхолдер чужого профиля на первую загрузку.
 *
 * Раньше здесь был абзац «Загрузка…», и страница схлопывалась в одну строку.
 * Скелетон держит геометрию шапки, поэтому приход данных её не двигает.
 */
export function UserDetailsPageSkeleton() {
  return (
    <div
      className="user-details-page"
      role="status"
      aria-label={USER_DETAILS_PAGE_UI.LOADING}
    >
      <div aria-hidden="true">
        <div className="iz-skeleton user-details-skeleton__banner">
          <span className="iz-skeleton iz-skeleton_circle user-details-skeleton__avatar" />
        </div>

        <span className="iz-skeleton iz-skeleton_line user-details-skeleton__name" />

        <div className="user-details-skeleton__stats">
          <span className="iz-skeleton user-details-skeleton__stat" />
          <span className="iz-skeleton user-details-skeleton__stat" />
          <span className="iz-skeleton user-details-skeleton__stat" />
        </div>

        <div className="user-details-skeleton__actions">
          <span className="iz-skeleton user-details-skeleton__action" />
          <span className="iz-skeleton user-details-skeleton__action" />
        </div>

        <div className="user-details-skeleton__body">
          <span className="iz-skeleton iz-skeleton_line user-details-skeleton__row" />
          <span className="iz-skeleton iz-skeleton_line user-details-skeleton__row user-details-skeleton__row_medium" />
          <span className="iz-skeleton iz-skeleton_line user-details-skeleton__row user-details-skeleton__row_short" />
        </div>
      </div>
    </div>
  );
}
