import { createContext, useContext } from "react";

/** @type {import('react').Context<import('./appShellStateTypes.js').AppShellStateValue | null>} */
const AppShellStateContext = createContext(null);

/**
 * @param {import('react').ReactNode} children
 * @param {import('./appShellStateTypes.js').AppShellStateValue} value
 */
export function AppShellStateProvider({ children, value }) {
  return (
    <AppShellStateContext.Provider value={value}>{children}</AppShellStateContext.Provider>
  );
}

/** @returns {import('./appShellStateTypes.js').AppShellStateValue} */
export function useAppShellStateContext() {
  const value = useContext(AppShellStateContext);
  if (!value) {
    throw new Error("useAppShellStateContext: контекст не инициализирован");
  }
  return value;
}
