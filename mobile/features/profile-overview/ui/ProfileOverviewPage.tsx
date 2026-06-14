import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { RaffleSellerOverview } from "@/features/profile-overview/ui/RaffleSellerOverview";
import { AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  section: {
    marginBottom: theme.spacing[1],
  },
}));

export const ProfileOverviewPage = () => {
  const router = useRouter();
  const styles = useStyles();
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user;

  const profileRows = useMemo(
    () => (user ? getUserProfileRows(user as Record<string, unknown>) : []),
    [user],
  );

  const showEditOnBanner =
    Boolean(user) &&
    resolveUserRole((user as { userRole?: string }).userRole) === USER_ROLE_USER;

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />;
  }

  if (sessionQuery.isError || !user) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(sessionQuery.error, AUTH_UI.SESSION_ERROR)}
        onRetry={() => sessionQuery.refetch()}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <ThemedRefreshControl refreshing={sessionQuery.isRefetching} onRefresh={sessionQuery.refetch} />
      }
    >
      <ProfileOverviewBanner
        user={user as Record<string, unknown>}
        showEditButton={showEditOnBanner}
        onEditPress={() => router.push("/profile/edit")}
      />

      <View style={styles.section}>
        <RaffleSellerOverview />
      </View>

      <UserProfileInfoPanel rows={profileRows} />
    </ScrollView>
  );
};
