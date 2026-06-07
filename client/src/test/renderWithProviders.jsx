import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import { createTestQueryClient } from "./createTestQueryClient.js";

/**
 * @param {import('react').ReactElement} ui
 * @param {{ queryClient?: import('@tanstack/react-query').QueryClient }} [options]
 */
export function renderWithProviders(ui, { queryClient = createTestQueryClient() } = {}) {
  function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
}
