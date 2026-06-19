import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { UserListRow } from "@/entities/user/ui/UserListRow";
import { useUsersGridLayout } from "@/features/users-page/model/useUsersGridLayout";
import { USERS_PAGE_UI } from "@/shared/config";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type UsersPageBodyProps = {
  phase: "loading" | "success" | "error";
  users: UserSearchListItem[];
  error: string;
  hasActiveFilters: boolean;
  isSearchInputTooShort?: boolean;
  onUserRowClick?: (userId: string) => void;
  onRefresh?: () => void;
  isRefetching?: boolean;
  canRefresh?: boolean;
};

export const UsersPageBody = ({
  phase,
  users,
  error,
  hasActiveFilters,
  isSearchInputTooShort = false,
  onUserRowClick,
  onRefresh,
  isRefetching = false,
  canRefresh = true,
}: UsersPageBodyProps) => {
  const styles = useUsersPageStyles();
  const grid = useUsersGridLayout();

  if (phase === "loading") {
    return <ScreenLoadingState message={USERS_PAGE_UI.LOADING} />;
  }

  if (phase === "error") {
    return (
      <ScreenErrorState
        message={error || USERS_PAGE_UI.FETCH_FALLBACK}
        onRetry={onRefresh}
      />
    );
  }

  if (users.length === 0) {
    const emptyMessage = isSearchInputTooShort
      ? USERS_PAGE_UI.SEARCH_TOO_SHORT
      : hasActiveFilters
        ? USERS_PAGE_UI.EMPTY_BY_QUERY
        : USERS_PAGE_UI.EMPTY;

    return <Text style={styles.state}>{emptyMessage}</Text>;
  }

  return (
    <FlatList
      key={grid.listKey}
      data={users}
      numColumns={grid.columns}
      keyExtractor={(item) => String(item._id)}
      style={styles.listFlex}
      contentContainerStyle={[styles.list, { gap: grid.gap }]}
      columnWrapperStyle={grid.columns > 1 ? { gap: grid.gap } : undefined}
      refreshControl={
        canRefresh && onRefresh ? (
          <ThemedRefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <UserListRow user={item} onRowClick={onUserRowClick} />
        </View>
      )}
    />
  );
};
