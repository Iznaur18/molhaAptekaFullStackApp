import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { StaffRaffleRow } from "@/entities/raffle/api/raffleStaffApi";
import {
  useRaffleStaffMutations,
  useStaffRafflesQueueQuery,
} from "@/entities/raffle/model/useRaffleStaffMutations";
import { RAFFLES_STAFF_PAGE_UI } from "@/shared/config";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type RowProps = {
  raffle: StaffRaffleRow;
  onChanged: () => void;
  approveMutation: ReturnType<typeof useRaffleStaffMutations>["approveMutation"];
  rejectMutation: ReturnType<typeof useRaffleStaffMutations>["rejectMutation"];
};

const RaffleRow = ({ raffle, onChanged, approveMutation, rejectMutation }: RowProps) => {
  const styles = useStaffQueueStyles();
  const [errorMessage, setErrorMessage] = useState("");
  const raffleId = String(raffle._id);
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    setErrorMessage("");
    try {
      await approveMutation.mutateAsync(raffleId);
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : RAFFLES_STAFF_PAGE_UI.ACTION_PENDING);
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync(raffleId);
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : RAFFLES_STAFF_PAGE_UI.ACTION_PENDING);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{raffle.title ?? "Розыгрыш"}</Text>
      <Text style={styles.meta}>
        {RAFFLES_STAFF_PAGE_UI.ROW_SELLER}: {raffle.seller?.userName ?? "—"}
      </Text>
      <Text style={styles.meta}>
        {RAFFLES_STAFF_PAGE_UI.ROW_TARGET}: {raffle.salesTarget ?? "—"}
      </Text>
      <StaffModerationActions
        approveLabel={RAFFLES_STAFF_PAGE_UI.APPROVE}
        rejectLabel={RAFFLES_STAFF_PAGE_UI.REJECT}
        pendingLabel={RAFFLES_STAFF_PAGE_UI.ACTION_PENDING}
        isBusy={isBusy}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const RafflesStaffPage = () => {
  const styles = useStaffQueueStyles();
  const queueQuery = useStaffRafflesQueueQuery();
  const { approveMutation, rejectMutation } = useRaffleStaffMutations();
  const raffles = queueQuery.data?.pendingRaffles ?? [];

  if (queueQuery.isPending && raffles.length === 0) {
    return <ScreenLoadingState message={RAFFLES_STAFF_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && raffles.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error ? queueQuery.error.message : RAFFLES_STAFF_PAGE_UI.LOADING
        }
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={raffles}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{RAFFLES_STAFF_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => (
        <RaffleRow
          raffle={item}
          onChanged={() => void queueQuery.refetch()}
          approveMutation={approveMutation}
          rejectMutation={rejectMutation}
        />
      )}
    />
  );
};
