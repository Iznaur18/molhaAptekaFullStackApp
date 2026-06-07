import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";
import { buildAddressSuggestions } from "../../../test/fixtures/apiFixtures.js";

const fetchAddressSuggestionsMock = vi.fn();

vi.mock("../api/fetchAddressSuggestions.js", () => ({
  fetchAddressSuggestions: (...args) => fetchAddressSuggestionsMock(...args),
}));

const { useAddressSuggestionsQuery } = await import("./useAddressSuggestionsQuery.js");

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
function createQueryWrapper(queryClient) {
  return function QueryWrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAddressSuggestionsQuery", () => {
  beforeEach(() => {
    fetchAddressSuggestionsMock.mockReset();
  });

  it("fetches suggestions when enabled", async () => {
    const suggestions = buildAddressSuggestions();
    fetchAddressSuggestionsMock.mockResolvedValue(suggestions);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useAddressSuggestionsQuery({ query: "Москва", enabled: true }),
      { wrapper: createQueryWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchAddressSuggestionsMock).toHaveBeenCalledWith("Москва");
    expect(result.current.data).toEqual(suggestions);
  });

  it("does not fetch when disabled", async () => {
    const queryClient = createTestQueryClient();

    renderHook(() => useAddressSuggestionsQuery({ query: "Москва", enabled: false }), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(fetchAddressSuggestionsMock).not.toHaveBeenCalled();
    });
  });
});
