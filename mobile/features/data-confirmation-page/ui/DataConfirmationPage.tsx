import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useMyDataConfirmationStatusQuery } from "@/entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery";
import { DataConfirmationRequestModal } from "@/features/data-confirmation-page/ui/DataConfirmationRequestModal";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const STATUS_PENDING = "pending";
const STATUS_REJECTED = "rejected";

export const DataConfirmationPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyDataConfirmationStatusQuery(isAuthorized);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>
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
    requestStatus === STATUS_REJECTED
      ? String(status?.request?.staffNote ?? "").trim()
      : "";
  const canOpenRequest =
    !isUserDataConfirmed && requestStatus !== STATUS_PENDING;

  const handleSubmitted = () => {
    Alert.alert("", USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.SUBMIT_SUCCESS);
    void statusQuery.refetch();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}
        </Text>
        <Text style={[styles.intro, { color: theme.colors.textMuted }]}>
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}
        </Text>
        {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
          <Text key={item} style={[styles.benefit, { color: theme.colors.text }]}>
            • {item}
          </Text>
        ))}
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>
          {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}
        </Text>

        {isUserDataConfirmed ? (
          <Text style={styles.statusOk}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
          </Text>
        ) : null}

        {!isUserDataConfirmed && requestStatus === STATUS_PENDING ? (
          <Text style={styles.statusPending}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
          </Text>
        ) : null}

        {!isUserDataConfirmed && requestStatus === STATUS_REJECTED ? (
          <Text style={styles.statusRejected}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
          </Text>
        ) : null}

        {canOpenRequest ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
            onPress={() => setRequestModalVisible(true)}
          >
            <Text style={styles.buttonText}>
              {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.OPEN_REQUEST}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <DataConfirmationRequestModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmitted={handleSubmitted}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
  },
  benefit: {
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  statusOk: {
    marginTop: 12,
    color: "#2e7d32",
    fontSize: 15,
    fontWeight: "600",
  },
  statusPending: {
    marginTop: 12,
    color: "#f57c00",
    fontSize: 15,
    fontWeight: "600",
  },
  statusRejected: {
    marginTop: 12,
    color: "#c62828",
    fontSize: 15,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
