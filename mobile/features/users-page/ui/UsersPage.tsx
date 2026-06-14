import { USER_SEARCH_MIN_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { UserListRow } from "@/entities/user/ui/UserListRow";
import { useUsersSearchQuery } from "@/entities/user/model/useUsersSearchQuery";
import {
  USER_SEARCH_INPUT_UI,
  USER_SEARCH_UI,
  USERS_PAGE_UI,
} from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const UsersPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, USER_SEARCH_UI.DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasSearchQuery = debouncedSearch.length >= USER_SEARCH_MIN_LENGTH;
  const { phase, users, error, refetch, isRefetching } = useUsersSearchQuery({
    search: debouncedSearch,
  });

  const handleUserPress = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  const listEmptyText = hasSearchQuery ? USERS_PAGE_UI.EMPTY_BY_QUERY : USERS_PAGE_UI.EMPTY;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface },
          ]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder={USER_SEARCH_INPUT_UI.PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchTerm.length > 0 ? (
          <Pressable onPress={() => setSearchTerm("")}>
            <Text style={{ color: theme.colors.link }}>{USER_SEARCH_INPUT_UI.CLEAR}</Text>
          </Pressable>
        ) : null}
      </View>

      {phase === "loading" ? <ScreenLoadingState message={USERS_PAGE_UI.LOADING} /> : null}

      {phase === "error" ? (
        <ScreenErrorState message={error || USERS_PAGE_UI.FETCH_FALLBACK} onRetry={() => refetch()} />
      ) : null}

      {phase === "success" ? (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          refreshControl={
            hasSearchQuery ? (
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            ) : undefined
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{listEmptyText}</Text>
          }
          renderItem={({ item }) => <UserListRow user={item} onPress={handleUserPress} />}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  list: {
    padding: 12,
    gap: 10,
    paddingBottom: 32,
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
});
