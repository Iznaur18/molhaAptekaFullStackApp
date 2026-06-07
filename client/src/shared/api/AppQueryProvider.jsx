import { QueryClientProvider } from "@tanstack/react-query";

import { createAppQueryClient } from "./queryClient.js";

const appQueryClient = createAppQueryClient();

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppQueryProvider({ children }) {
  return (
    <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
  );
}
