import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useUsersSearchQuery } from "@/entities/user/model/useUsersSearchQuery";
import { UsersPageBody } from "@/features/users-page/ui/UsersPageBody";
import { UsersPageSearchBar } from "@/features/users-page/ui/UsersPageSearchBar";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";

export const UsersPage = () => {
  const router = useRouter();
  const styles = useUsersPageStyles();
  const { contentPaddingTop, centeredContentStyle } = useScreenLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const normalizedSearch = submittedSearch.trim();
  const hasSearchQuery = normalizedSearch.length >= USER_SEARCH_MIN_LENGTH;

  const { phase, users, error, refetch, isRefetching, isSearchInputTooShort } =
    useUsersSearchQuery({
      search: submittedSearch,
    });

  const isSearchPending = hasSearchQuery && phase === "loading";

  // Ввод не ищет сам по себе — запрос уходит по «Найти» на клавиатуре. Пустое
  // поле не поиск, а отмена: список возвращается к общему сразу.
  const handleSearchTermChange = (next: string) => {
    setSearchTerm(next);
    if (next.trim() === "") {
      setSubmittedSearch("");
    }
  };

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchTerm);
  };

  const handleUserPress = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  const canRefreshList = !isSearchInputTooShort;

  return (
    <View style={styles.screen}>
      <View style={[styles.screen, centeredContentStyle, { paddingTop: contentPaddingTop }]}>
        <UsersPageSearchBar
          value={searchTerm}
          onChange={handleSearchTermChange}
          onSubmit={handleSearchSubmit}
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
    </View>
  );
};
