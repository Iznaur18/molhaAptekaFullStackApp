import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { useMyDataConfirmationStatusQuery } from "@/entities/user-data-confirmation/model/useMyDataConfirmationStatusQuery";
import { DataConfirmationRequestModal } from "@/features/data-confirmation-page/ui/DataConfirmationRequestModal";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { USER_DATA_CONFIRMATION_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import {
  useDataConfirmationPageStyles,
  useFormFieldStyles,
} from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const STATUS_PENDING = "pending";
const STATUS_REJECTED = "rejected";

export const DataConfirmationPage = () => {
  const router = useRouter();
  const pageStyles = useDataConfirmationPageStyles();
  const fieldStyles = useFormFieldStyles();
  const isAuthorized = useIsAuthorized();
  const statusQuery = useMyDataConfirmationStatusQuery(isAuthorized);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  if (!isAuthorized) {
    return (
      <View style={pageStyles.centered}>
        <Text style={pageStyles.hint}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_HINT}</Text>
        <AppButton
          label={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.LOGIN_BUTTON}
          variant="contrast"
          onPress={() => router.push("/(auth)/login")}
        />
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
      <ScrollView contentContainerStyle={pageStyles.container}>
        <Text style={pageStyles.title}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_TITLE}</Text>
        <Text style={pageStyles.intro}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_INTRO}</Text>
        {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_BENEFITS.map((item) => (
          <Text key={item} style={pageStyles.benefit}>
            • {item}
          </Text>
        ))}
        <Text style={pageStyles.note}>{USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.PLAN_NOTE}</Text>

        {isUserDataConfirmed ? (
          <Text style={[fieldStyles.statusOk, pageStyles.statusBlock]}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_CONFIRMED}
          </Text>
        ) : null}

        {!isUserDataConfirmed && requestStatus === STATUS_PENDING ? (
          <Text style={[fieldStyles.statusPending, pageStyles.statusBlock]}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_PENDING}
          </Text>
        ) : null}

        {!isUserDataConfirmed && requestStatus === STATUS_REJECTED ? (
          <Text style={[fieldStyles.statusRejected, pageStyles.statusBlock]}>
            {USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.STATUS_REJECTED(staffNote)}
          </Text>
        ) : null}

        {canOpenRequest ? (
          <AppButton
            label={USER_DATA_CONFIRMATION_PROFILE_PAGE_UI.OPEN_REQUEST}
            variant="contrast"
            onPress={() => setRequestModalVisible(true)}
            style={pageStyles.actionSpacer}
          />
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
