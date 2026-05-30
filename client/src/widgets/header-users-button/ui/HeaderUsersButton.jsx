import { HEADER_USERS_BUTTON_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { Users } from "../../../shared/ui/icon/index.js";

/**
 * @param {{ onClick: () => void; isActive?: boolean }} props
 */
export function HeaderUsersButton({ onClick, isActive = false }) {
  return (
    <HeaderCircleIconButton
      onClick={onClick}
      isActive={isActive}
      ariaLabel={HEADER_USERS_BUTTON_UI.ARIA}
      icon={Users}
    />
  );
}
