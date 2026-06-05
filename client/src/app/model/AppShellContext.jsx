import { createContext, useContext } from "react";

/** @type {import('react').Context<import('./useAppShellController.js').AppShellControllerValue | null>} */
const AppShellContext = createContext(null);

/**
 * @param {import('react').ReactNode} children
 * @param {import('./useAppShellController.js').AppShellControllerValue} value
 */
export function AppShellProvider({ children, value }) {
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

/** @returns {import('./useAppShellController.js').AppShellControllerValue} */
export function useAppShell() {
  const value = useContext(AppShellContext);
  if (!value) {
    throw new Error("useAppShell: оболочка приложения не инициализирована");
  }
  return value;
}
