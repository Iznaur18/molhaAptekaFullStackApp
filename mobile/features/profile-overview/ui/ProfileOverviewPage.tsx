import { useRouter } from "expo-router";

import { ProfileTabOverviewSection } from "@/features/profile-tab/ui/ProfileTabOverviewSection";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";
import { ScrollView, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  bodyCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[4],
  },
}));

export const ProfileOverviewPage = () => {
  const router = useRouter();
  const styles = useStyles();
  const sessionQuery = useAuthSessionQuery();

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />;
  }

  if (sessionQuery.isError || !sessionQuery.data?.user) {
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
      <View style={styles.bodyCard}>
        <ProfileTabOverviewSection
          onEditPress={() => router.push("/profile/edit")}
        />
      </View>
    </ScrollView>
  );
};
