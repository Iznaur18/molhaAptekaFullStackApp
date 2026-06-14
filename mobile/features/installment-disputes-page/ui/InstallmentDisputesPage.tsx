import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { InstallmentDispute } from "@/entities/installment/api/installmentStaffApi";
import {
  useInstallmentStaffMutations,
  usePendingInstallmentDisputesQuery,
} from "@/entities/installment/model/useInstallmentStaffMutations";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type RowProps = {
  dispute: InstallmentDispute;
  onChanged: () => void;
  resolveMutation: ReturnType<typeof useInstallmentStaffMutations>["resolveDisputeMutation"];
};

const DisputeRow = ({ dispute, onChanged, resolveMutation }: RowProps) => {
  const styles = useStaffQueueStyles();
  const [errorMessage, setErrorMessage] = useState("");
  const isBusy = resolveMutation.isPending;

  const resolve = async (action: string) => {
    setErrorMessage("");
    try {
      await resolveMutation.mutateAsync({
        disputeId: dispute._id,
        body: { action },
      });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{dispute.contractId}</Text>
      <Text style={styles.meta}>
        {INSTALLMENT_UI.DISPUTE_REASON}: {dispute.reason}
      </Text>
      {dispute.createdAt ? (
        <Text style={styles.meta}>{formatIsoDateTime(dispute.createdAt)}</Text>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          label={INSTALLMENT_UI.DISPUTE_ACTION_CLOSE}
          variant="success"
          disabled={isBusy}
          onPress={() => void resolve("close")}
        />
        <AppButton
          label={INSTALLMENT_UI.DISPUTE_ACTION_CANCEL}
          variant="danger"
          disabled={isBusy}
          onPress={() => void resolve("cancel")}
        />
        <AppButton
          label={INSTALLMENT_UI.DISPUTE_ACTION_ADJUST}
          variant="primary"
          disabled={isBusy}
          onPress={() => void resolve("adjust_schedule")}
        />
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

export const InstallmentDisputesPage = () => {
  const styles = useStaffQueueStyles();
  const queueQuery = usePendingInstallmentDisputesQuery();
  const { resolveDisputeMutation } = useInstallmentStaffMutations();
  const disputes = queueQuery.data ?? [];

  if (queueQuery.isPending && disputes.length === 0) {
    return <ScreenLoadingState message={INSTALLMENT_UI.DISPUTES_PAGE_LOADING} />;
  }

  if (queueQuery.isError && disputes.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error ? queueQuery.error.message : INSTALLMENT_UI.ERROR_GENERIC
        }
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={disputes}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{INSTALLMENT_UI.DISPUTES_PAGE_EMPTY}</Text>}
      renderItem={({ item }) => (
        <DisputeRow
          dispute={item}
          onChanged={() => void queueQuery.refetch()}
          resolveMutation={resolveDisputeMutation}
        />
      )}
    />
  );
};
