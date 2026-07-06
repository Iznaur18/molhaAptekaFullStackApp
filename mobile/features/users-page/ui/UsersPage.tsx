import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useUsersSearchQuery } from "@/entities/user/model/useUsersSearchQuery";
import { UsersPageBody } from "@/features/users-page/ui/UsersPageBody";
import { UsersPageSearchBar } from "@/features/users-page/ui/UsersPageSearchBar";
import { USER_SEARCH_UI } from "@/shared/config";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";

export const UsersPage = () => {
  const router = useRouter();
  const styles = useUsersPageStyles();
  const { contentPaddingTop } = useScreenLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, USER_SEARCH_UI.DEBOUNCE_MS);
  const isSearchPending = searchTerm !== debouncedSearch;
  const normalizedSearch = debouncedSearch.trim();
  const hasSearchQuery = normalizedSearch.length >= USER_SEARCH_MIN_LENGTH;

  const { phase, users, error, refetch, isRefetching, isSearchInputTooShort } =
    useUsersSearchQuery({
      search: debouncedSearch,
    });

  const handleUserPress = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  const canRefreshList = !isSearchInputTooShort;

  return (
    <View style={[styles.screen, { paddingTop: contentPaddingTop }]}>
      <UsersPageSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        isPending={isSearchPending}
      />
      <UsersPageBody
        phase={phase}
        users={users}
        error={error}
        hasActiveFilters={hasSearchQuery}
        isSearchInputTooShort={isSearchInputTooShort}
        onUserRowClick={handleUserPress}
        onRefresh={() => {
          void refetch();
        }}
        isRefetching={isRefetching}
        canRefresh={canRefreshList}
      />
    </View>
  );
};
