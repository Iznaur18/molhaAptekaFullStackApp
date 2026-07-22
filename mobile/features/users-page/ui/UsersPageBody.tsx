import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { excludeUsersPodiumFromList, rankUsersForPodium } from "@izibuy/shared-lib";

import type { UserSearchListItem } from "@/entities/user/api/fetchUsersSearchPage";
import { useUsersMonthlyLoyaltyPointsQuery } from "@/entities/user/model/useUsersMonthlyLoyaltyPointsQuery";
import { UserListRow } from "@/entities/user/ui/UserListRow";
import { useUsersGridLayout } from "@/features/users-page/model/useUsersGridLayout";
import { UsersMonthlyLoyaltyLoadBar } from "@/features/users-page/ui/UsersMonthlyLoyaltyLoadBar";
import { UsersPodium } from "@/features/users-page/ui/UsersPodium";
import { USERS_PAGE_UI } from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useUsersPageStyles } from "@/shared/theme/usersPageStyles";
import { useUsersPagePodiumListStyles } from "@/shared/theme/usersPodiumStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

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
  const podiumListStyles = useUsersPagePodiumListStyles();
  const { contentPaddingBottom } = useScreenLayout();
  const grid = useUsersGridLayout();

  const showPodium = !hasActiveFilters && !isSearchInputTooShort;
  const monthlyLoyaltyQuery = useUsersMonthlyLoyaltyPointsQuery({ enabled: showPodium });

  const podiumEntries = useMemo(
    () => (showPodium ? rankUsersForPodium(users) : []),
    [showPodium, users],
  );
  const listUsers = useMemo(
    () => excludeUsersPodiumFromList(users, podiumEntries),
    [users, podiumEntries],
  );

  const listHeader = useMemo(() => {
    if (!showPodium) {
      return null;
    }

    const pointsAwarded = monthlyLoyaltyQuery.data?.pointsAwarded ?? 0;
    const goal = monthlyLoyaltyQuery.data?.goal ?? 0;
    const description = monthlyLoyaltyQuery.data?.description ?? "";

    return (
      <View style={podiumListStyles.listHeader}>
        {podiumEntries.length > 0 ? (
          <UsersPodium entries={podiumEntries} onUserPress={onUserRowClick} />
        ) : null}
        <UsersMonthlyLoyaltyLoadBar
          pointsAwarded={pointsAwarded}
          goal={goal}
          description={description}
          isLoading={monthlyLoyaltyQuery.isPending && monthlyLoyaltyQuery.data == null}
        />
      </View>
    );
  }, [
    monthlyLoyaltyQuery.data,
    monthlyLoyaltyQuery.isPending,
    onUserRowClick,
    podiumEntries,
    podiumListStyles.listHeader,
    showPodium,
  ]);

  const handleRefresh = () => {
    onRefresh?.();
    if (showPodium) {
      void monthlyLoyaltyQuery.refetch();
    }
  };

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
      data={listUsers}
      numColumns={grid.columns}
      keyExtractor={(item) => String(item._id)}
      style={styles.listFlex}
      contentContainerStyle={[
        styles.list,
        { gap: grid.gap, paddingBottom: contentPaddingBottom },
      ]}
      columnWrapperStyle={grid.columns > 1 ? { gap: grid.gap } : undefined}
      ListHeaderComponent={listHeader}
      refreshControl={
        canRefresh && onRefresh ? (
          <ThemedRefreshControl
            refreshing={isRefetching || monthlyLoyaltyQuery.isRefetching}
            onRefresh={handleRefresh}
          />
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
