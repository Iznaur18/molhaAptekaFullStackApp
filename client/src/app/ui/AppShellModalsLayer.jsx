import { AppShellAuthModals } from "./modals/AppShellAuthModals.jsx";
import { AppShellProductModals } from "./modals/AppShellProductModals.jsx";
import { AppShellStaffDisplayModals } from "./modals/AppShellStaffDisplayModals.jsx";
import { AppShellUserModals } from "./modals/AppShellUserModals.jsx";

/** @typedef {import('../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {Record<string, unknown>} props — полный набор пропсов AppShell (см. useHomeModalsLayerProps).
 */
export function AppShellModalsLayer(props) {
  return (
    <>
      <AppShellUserModals {...props} />
      <AppShellAuthModals {...props} />
      <AppShellProductModals {...props} />
      <AppShellStaffDisplayModals {...props} />
    </>
  );
}
