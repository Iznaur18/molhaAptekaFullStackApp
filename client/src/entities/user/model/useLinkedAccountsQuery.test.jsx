import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "../../../test/createTestQueryClient.js";
import { authMeQueryKeys } from "./authMeQueryKeys.js";
import { useLinkedAccountsQuery } from "./useLinkedAccountsQuery.js";

const fetchLinkedAccounts = vi.fn();

vi.mock("../api/linkedAccountsApi.js", () => ({
  fetchLinkedAccounts: () => fetchLinkedAccounts(),
}));

describe("useLinkedAccountsQuery", () => {
  it("после входа без перезагрузки перезапрашивает список, снятый гостем", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(authMeQueryKeys.all, { user: null });
    fetchLinkedAccounts.mockResolvedValueOnce({
      accounts: [{ userId: "a", isActive: false, requiresLogin: true }],
      maxAccounts: 5,
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useLinkedAccountsQuery(), { wrapper });
    await waitFor(() => expect(result.current.data?.accounts[0].isActive).toBe(false));

    fetchLinkedAccounts.mockResolvedValueOnce({
      accounts: [{ userId: "a", isActive: true, requiresLogin: false }],
      maxAccounts: 5,
    });
    act(() => {
      queryClient.setQueryData(authMeQueryKeys.all, { user: { _id: "a" } });
    });

    await waitFor(() => expect(result.current.data?.accounts[0].isActive).toBe(true));
    expect(fetchLinkedAccounts).toHaveBeenCalledTimes(2);
  });
});
