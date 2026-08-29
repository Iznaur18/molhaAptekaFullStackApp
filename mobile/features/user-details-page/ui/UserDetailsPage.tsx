import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { AdminUserStaffActions } from "@/entities/user/ui/AdminUserStaffActions";
import { UserVoteRatingForm } from "@/features/user-vote-rating/ui/UserVoteRatingForm";
import { UserDetailsHeader } from "@/features/user-details-page/ui/UserDetailsHeader";
import { UserDetailsProfileBody } from "@/features/user-details-page/ui/UserDetailsProfileBody";
import { useUserDetailsPage } from "@/features/user-details-page/model/useUserDetailsPage";
import { USER_DETAILS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useUserDetailsPageStyles } from "@/shared/theme/profileChromeStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";
import { ScreenWithBack } from "@/shared/ui/ScreenWithBack";

export const UserDetailsPage = () => {
  const router = useRouter();
  const styles = useUserDetailsPageStyles();
  const { centeredContentStyle } = useScreenLayout();
  const {
    userId,
    user,
    profileQuery,
    profileRows,
    currentUserId,
    isAuthorized,
    isSelf,
    showOtherUserProducts,
    showOtherUserPurchases,
    canModerate,
    handleFollowChange,
    handleBlockChange,
    handleRated,
    handleViewAllSellerProducts,
    handleEditUser,
  } = useUserDetailsPage();

  if (!userId) {
    return (
      <ScreenWithBack>
        <ScreenErrorState
          message={USER_DETAILS_PAGE_UI.FETCH_FALLBACK}
          onRetry={() => router.back()}
        />
      </ScreenWithBack>
    );
  }

  if (profileQuery.isPending) {
    return (
      <ScreenWithBack>
        <ScreenLoadingState message={USER_DETAILS_PAGE_UI.LOADING} />
      </ScreenWithBack>
    );
  }

  if (profileQuery.isError || !user) {
    return (
      <ScreenWithBack>
        <ScreenErrorState
          message={formatApiErrorMessage(profileQuery.error, USER_DETAILS_PAGE_UI.FETCH_FALLBACK)}
          onRetry={() => profileQuery.refetch()}
        />
      </ScreenWithBack>
    );
  }

  const isFollowing = user.isFollowing === true;

  return (
    <View style={styles.screen}>
      <View style={[styles.screen, centeredContentStyle]}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <ThemedRefreshControl refreshing={profileQuery.isRefetching} onRefresh={profileQuery.refetch} />
          }
        >
          <UserDetailsHeader
            user={user}
            userId={userId}
            isFollowing={isFollowing}
            isAuthorized={isAuthorized}
            isSelf={isSelf}
            onFollowChange={handleFollowChange}
          />

          <UserDetailsProfileBody
            user={user}
            userId={userId}
            profileRows={profileRows}
            showOtherUserPurchases={showOtherUserPurchases}
            showOtherUserProducts={showOtherUserProducts}
            isAuthorized={isAuthorized}
            onViewAllSellerProducts={handleViewAllSellerProducts}
            onRequestLogin={() => router.push("/(auth)/login")}
            onBlockedChange={handleBlockChange}
          />

          {canModerate && !isSelf ? <AdminUserStaffActions onEditPress={handleEditUser} /> : null}

          <UserVoteRatingForm
            targetUser={user as Record<string, unknown> & { _id: string }}
            currentUserId={currentUserId}
            isAuthorized={isAuthorized}
            onRated={handleRated}
          />
        </ScrollView>
      </View>
    </View>
  );
};
