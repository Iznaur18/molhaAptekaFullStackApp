import { CircleAlert } from "lucide-react";

import { AppIcon } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ show?: boolean }} props
 */
export function ProfileTabAlert({ show = false }) {
  if (!show) {
    return null;
  }

  return (
    <span className="my-profile-page__nav-alert" aria-hidden="true">
      <AppIcon icon={CircleAlert} size="sm" strokeWidth={2.25} />
    </span>
  );
}
