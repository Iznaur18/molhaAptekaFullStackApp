import { StrictMode } from "react";

export function AppProviders({ children }) {
  return <StrictMode>{children}</StrictMode>;
}
