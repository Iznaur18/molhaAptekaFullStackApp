import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "@/entities/user-data-confirmation/model/constants";
import { useMyDataConfirmationStatusQuery } from "@/entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { DataConfirmationRequestModal } from "@/features/data-confirmation-page/ui/DataConfirmationRequestModal";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useDataConfirmationPageStyles } from "@/shared/theme/dataConfirmationPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const DataConfirmationPage = () => {
  const router = useRouter();
  const styles = useDataConfirmationPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyDataConfirmationStatusQuery(isAuthorized);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void statusQuery.refetch();
      }
    }, [isAuthorized, statusQuery.refetch]),
  );

  const handleSubmitted = () => {
    Alert.alert("", USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.SUBMIT_SUCCESS);
    void statusQuery.refetch();
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_BUTTON}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (statusQuery.isPending) {
    return <ScreenLoadingState message={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOADING} />;
  }

  if (statusQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          statusQuery.error,
          USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  const status = statusQuery.data;
  const isUserDataConfirmed = status?.isUserDataConfirmed === true;
  const requestStatus = status?.request?.status ?? null;
  const staffNote =
    requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED
      ? String(status?.request?.staffNote ?? "").trim()
      : "";
  const canOpenRequest =
    !isUserDataConfirmed && requestStatus !== USER_DATA_CONFIRMATION_STATUS_PENDING;

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
            onPress={() => setNavSheetVisible(true)}
          />

          <View style={styles.plan}>
            <Text style={styles.planTitle}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}</Text>
            <Text style={styles.planIntro}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}</Text>
            <View style={styles.benefits}>
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
                <Text key={item} style={styles.benefit}>
                  • {item}
                </Text>
              ))}
            </View>
            <Text style={styles.planNote}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}</Text>
          </View>

          {isUserDataConfirmed ? (
            <Text
              style={[styles.status, styles.statusOk]}
              accessibilityRole="text"
            >
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
            </Text>
          ) : null}

          {!isUserDataConfirmed && requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
            <Text
              style={[styles.status, styles.statusPending]}
              accessibilityRole="text"
            >
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
            </Text>
          ) : null}

          {!isUserDataConfirmed && requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
            <Text
              style={[styles.status, styles.statusRejected]}
              accessibilityRole="alert"
            >
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
            </Text>
          ) : null}

          {canOpenRequest ? (
            <Pressable
              style={styles.submit}
              onPress={() => setRequestModalVisible(true)}
            >
              <Text style={styles.submitText}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.OPEN_REQUEST}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <DataConfirmationRequestModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmitted={handleSubmitted}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="data-confirmation"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
