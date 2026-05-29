import { HEADER_PROFILE_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { User } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderProfileButton({ onClick, isActive = false }) {
  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_PROFILE_BUTTON_UI.ARIA}
      icon={User}
    />
  );
}
