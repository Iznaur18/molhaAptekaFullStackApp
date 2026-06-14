import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import type { DataConfirmationRequest } from "@/entities/user-data-confirmation/api/dataConfirmationStaffApi";
import {
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
} from "@/entities/user-data-confirmation/model/constants";
import {
  usePendingDataConfirmationRequestsQuery,
  useResolveDataConfirmationRequestMutation,
} from "@/entities/user-data-confirmation/model/useDataConfirmationStaffMutations";
import { DATA_CONFIRMATION_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

type RowProps = {
  request: DataConfirmationRequest;
  onChanged: () => void;
  resolveMutation: ReturnType<typeof useResolveDataConfirmationRequestMutation>;
};

const RequestRow = ({ request, onChanged, resolveMutation }: RowProps) => {
  const [staffNote, setStaffNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = resolveMutation.isPending;

  const handleResolve = async (resolution: string) => {
    if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT) {
      if (countWords(staffNote) < DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS) {
        setErrorMessage(
          `Комментарий: не меньше ${DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS} слов`,
        );
        return;
      }
    }
    setErrorMessage("");
    try {
      await resolveMutation.mutateAsync({
        requestId: String(request._id),
        body: {
          resolution,
          staffNote:
            resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT ? staffNote.trim() : "",
        },
      });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : DATA_CONFIRMATION_PAGE_UI.ACTION_PENDING);
    }
  };

  const passport = request.passport ?? {};
  const fullName = [
    passport.lastName,
    passport.firstName,
    passport.middleName,
  ]
    .map((part) => (part == null ? "" : String(part)))
    .filter(Boolean)
    .join(" ");

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{request.user?.userName ?? "Заявитель"}</Text>
      {request.createdAt ? (
        <Text style={styles.meta}>
          {DATA_CONFIRMATION_PAGE_UI.SUBMITTED_LABEL}: {formatIsoDateTime(request.createdAt)}
        </Text>
      ) : null}
      <Text style={styles.meta}>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SECTION}</Text>
      <Text style={styles.meta}>{fullName || "—"}</Text>
      <StaffModerationActions
        approveLabel={DATA_CONFIRMATION_PAGE_UI.ACTION_APPROVE}
        rejectLabel={DATA_CONFIRMATION_PAGE_UI.ACTION_REJECT}
        pendingLabel={DATA_CONFIRMATION_PAGE_UI.ACTION_PENDING}
        isBusy={isBusy}
        note={staffNote}
        onNoteChange={setStaffNote}
        notePlaceholder={DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
        onApprove={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_APPROVE)}
        onReject={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_REJECT)}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const DataConfirmationRequestsPage = () => {
  const queueQuery = usePendingDataConfirmationRequestsQuery();
  const resolveMutation = useResolveDataConfirmationRequestMutation();
  const requests = queueQuery.data ?? [];

  if (queueQuery.isPending && requests.length === 0) {
    return <ScreenLoadingState message={DATA_CONFIRMATION_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && requests.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error ? queueQuery.error.message : DATA_CONFIRMATION_PAGE_UI.LOADING
        }
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{DATA_CONFIRMATION_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => (
        <RequestRow
          request={item}
          onChanged={() => void queueQuery.refetch()}
          resolveMutation={resolveMutation}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 12, gap: 16 },
  row: { gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 13, color: "#666" },
  empty: { textAlign: "center", color: "#666", padding: 24 },
});
