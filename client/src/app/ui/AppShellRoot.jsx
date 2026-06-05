import { AppShellProvider } from "../model/AppShellContext.jsx";
import { useAppShellController } from "../model/useAppShellController.js";

import { AppShellLayout } from "./AppShellLayout.jsx";

/**
 * Route layout root: один контроллер на всё дерево маршрутов под shell.
 */
export function AppShellRoot() {
  const shell = useAppShellController();

  return (
    <AppShellProvider value={shell}>
      <AppShellLayout />
    </AppShellProvider>
  );
}
