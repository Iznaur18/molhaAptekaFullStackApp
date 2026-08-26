import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import {
  USER_DATA_CONFIRMATION_STATUS_PENDING,
  USER_DATA_CONFIRMATION_STATUS_REJECTED,
} from "@/entities/user-data-confirmation/model/constants";
import { useMyDataConfirmationStatusQuery } from "@/entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { DataConfirmationRequestModal } from "@/features/data-confirmation-page/ui/DataConfirmationRequestModal";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { MY_PROFILE_PAGE_UI, USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useDataConfirmationPageStyles } from "@/shared/theme/dataConfirmationPageStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const DataConfirmationPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useDataConfirmationPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
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
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PAGE_ARIA}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
            onPress={() => setNavSheetVisible(true)}
          />

          <View
            style={styles.heroCard}
            accessibilityLabel={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
          >
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
              </Text>
              <Text style={styles.heroInfo}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Feather
                name="user-check"
                size={24}
                color={theme.colors.onContrast}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.BENEFITS_TITLE}
            </Text>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
              <View key={item} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <Feather
                    name="check"
                    size={16}
                    color={theme.colors.info}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                </View>
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.planNote}>
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}
            </Text>
          </View>

          {isUserDataConfirmed ? (
            <View style={[styles.statusBanner, styles.statusOk]} accessibilityRole="text">
              <Feather
                name="check-circle"
                size={18}
                color={theme.colors.successText}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={[styles.statusText, styles.statusOkText]}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
              </Text>
            </View>
          ) : null}

          {!isUserDataConfirmed && requestStatus === USER_DATA_CONFIRMATION_STATUS_PENDING ? (
            <View style={[styles.statusBanner, styles.statusPending]} accessibilityRole="text">
              <Feather
                name="clock"
                size={18}
                color={theme.colors.warningText}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={[styles.statusText, styles.statusPendingText]}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
              </Text>
            </View>
          ) : null}

          {!isUserDataConfirmed && requestStatus === USER_DATA_CONFIRMATION_STATUS_REJECTED ? (
            <View style={[styles.statusBanner, styles.statusRejected]} accessibilityRole="alert">
              <Feather
                name="alert-circle"
                size={18}
                color={theme.colors.danger}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={[styles.statusText, styles.statusRejectedText]}>
                {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
              </Text>
            </View>
          ) : null}

          {canOpenRequest ? (
            <AppButton
              label={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.OPEN_REQUEST}
              variant="primary"
              style={styles.submitButton}
              onPress={() => setRequestModalVisible(true)}
            />
          ) : null}
        </View>
      </ProfileAccountScrollBody>

      <DataConfirmationRequestModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmitted={handleSubmitted}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="data-confirmation"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
