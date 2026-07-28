import { APP_SHELL_TABLET_MAX_PX } from "./appShellLayoutConstants.js";

/**
 * Compact chrome (mobile topbar + mobile-top actions) до large-tablet exclusive.
 * Совпадает с `@container app-viewport (max-width: 1023px)` header-правил в `AppShell.css`.
 */
export const APP_SHELL_MOBILE_NAV_BREAKPOINT_PX = APP_SHELL_TABLET_MAX_PX;
