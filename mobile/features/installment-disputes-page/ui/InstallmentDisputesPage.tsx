import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import type { InstallmentDispute } from "@/entities/installment/api/installmentStaffApi";
import {
  useInstallmentStaffMutations,
  usePendingInstallmentDisputesQuery,
} from "@/entities/installment/model/useInstallmentStaffMutations";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type RowProps = {
  dispute: InstallmentDispute;
  onChanged: () => void;
  resolveMutation: ReturnType<typeof useInstallmentStaffMutations>["resolveDisputeMutation"];
};

const DisputeRow = ({ dispute, onChanged, resolveMutation }: RowProps) => {
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
        <Pressable
          style={[styles.button, styles.primaryButton, isBusy && styles.disabled]}
          onPress={() => void resolve("close")}
          disabled={isBusy}
        >
          <Text style={styles.buttonText}>{INSTALLMENT_UI.DISPUTE_ACTION_CLOSE}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.cancelButton, isBusy && styles.disabled]}
          onPress={() => void resolve("cancel")}
          disabled={isBusy}
        >
          <Text style={styles.buttonText}>{INSTALLMENT_UI.DISPUTE_ACTION_CANCEL}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.adjustButton, isBusy && styles.disabled]}
          onPress={() => void resolve("adjust_schedule")}
          disabled={isBusy}
        >
          <Text style={styles.buttonText}>{INSTALLMENT_UI.DISPUTE_ACTION_ADJUST}</Text>
        </Pressable>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

export const InstallmentDisputesPage = () => {
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
        <RefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
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

const styles = StyleSheet.create({
  list: { padding: 12, gap: 16 },
  row: { gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 13, color: "#666" },
  actions: { gap: 8, marginTop: 8 },
  button: { borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  primaryButton: { backgroundColor: "#2e7d32" },
  cancelButton: { backgroundColor: "#c62828" },
  adjustButton: { backgroundColor: "#1565c0" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  disabled: { opacity: 0.6 },
  error: { color: "#c62828", fontSize: 13 },
  empty: { textAlign: "center", color: "#666", padding: 24 },
});
