import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { PendingInstallmentProgram } from "@/entities/installment/api/installmentStaffApi";
import {
  useInstallmentStaffMutations,
  usePendingInstallmentModerationQuery,
} from "@/entities/installment/model/useInstallmentStaffMutations";
import { INSTALLMENT_UI } from "@/shared/config";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type RowProps = {
  program: PendingInstallmentProgram;
  onChanged: () => void;
  approveMutation: ReturnType<typeof useInstallmentStaffMutations>["approveModerationMutation"];
  rejectMutation: ReturnType<typeof useInstallmentStaffMutations>["rejectModerationMutation"];
};

const ProgramRow = ({ program, onChanged, approveMutation, rejectMutation }: RowProps) => {
  const styles = useStaffQueueStyles();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const productId = String(program.productId);
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    setErrorMessage("");
    try {
      await approveMutation.mutateAsync(productId);
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync({ productId, comment });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push(`/product/${productId}`)}>
        <Text style={styles.titleAccent}>{program.productName ?? INSTALLMENT_UI.CONTRACT_PRODUCT}</Text>
      </Pressable>
      <Text style={styles.meta}>
        {INSTALLMENT_UI.PLANS_LABEL}: {program.plans?.length ?? 0}
      </Text>
      <StaffModerationActions
        approveLabel={INSTALLMENT_UI.MODERATION_APPROVE}
        rejectLabel={INSTALLMENT_UI.MODERATION_REJECT}
        pendingLabel={INSTALLMENT_UI.ACTION_PENDING}
        isBusy={isBusy}
        note={comment}
        onNoteChange={setComment}
        notePlaceholder={INSTALLMENT_UI.MODERATION_REJECT_PLACEHOLDER}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const InstallmentModerationPage = () => {
  const styles = useStaffQueueStyles();
  const queueQuery = usePendingInstallmentModerationQuery();
  const { approveModerationMutation, rejectModerationMutation } = useInstallmentStaffMutations();
  const programs = queueQuery.data ?? [];

  if (queueQuery.isPending && programs.length === 0) {
    return <ScreenLoadingState message={INSTALLMENT_UI.MODERATION_PAGE_LOADING} />;
  }

  if (queueQuery.isError && programs.length === 0) {
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
      data={programs}
      keyExtractor={(item) => String(item.productId)}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{INSTALLMENT_UI.MODERATION_PAGE_EMPTY}</Text>}
      renderItem={({ item }) => (
        <ProgramRow
          program={item}
          onChanged={() => void queueQuery.refetch()}
          approveMutation={approveModerationMutation}
          rejectMutation={rejectModerationMutation}
        />
      )}
    />
  );
};
