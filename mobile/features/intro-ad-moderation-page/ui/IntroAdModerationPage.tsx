import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import {
  useIntroAdModerationMutations,
  usePendingIntroAdCampaignsQuery,
} from "@/entities/intro-ad/model/useIntroAdModerationMutations";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type CampaignRow = Record<string, unknown> & {
  _id: string;
  advertiser?: { userName?: string } | null;
  createdAt?: string;
};

type RowProps = {
  campaign: CampaignRow;
  onChanged: () => void;
  approveMutation: ReturnType<typeof useIntroAdModerationMutations>["approveMutation"];
  rejectMutation: ReturnType<typeof useIntroAdModerationMutations>["rejectMutation"];
};

const IntroAdRow = ({ campaign, onChanged, approveMutation, rejectMutation }: RowProps) => {
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const campaignId = String(campaign._id);
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    setErrorMessage("");
    try {
      await approveMutation.mutateAsync(campaignId);
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK);
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync({ campaignId, reason });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>
        {INTRO_AD_MODERATION_PAGE_UI.ADVERTISER_LABEL}:{" "}
        {campaign.advertiser?.userName ?? "—"}
      </Text>
      {campaign.createdAt ? (
        <Text style={styles.meta}>{formatIsoDateTime(campaign.createdAt)}</Text>
      ) : null}
      <StaffModerationActions
        approveLabel={INTRO_AD_MODERATION_PAGE_UI.APPROVE}
        rejectLabel={INTRO_AD_MODERATION_PAGE_UI.REJECT}
        pendingLabel={INTRO_AD_MODERATION_PAGE_UI.ACTION_PENDING}
        isBusy={isBusy}
        note={reason}
        onNoteChange={setReason}
        notePlaceholder={INTRO_AD_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const IntroAdModerationPage = () => {
  const queueQuery = usePendingIntroAdCampaignsQuery();
  const { approveMutation, rejectMutation } = useIntroAdModerationMutations();
  const campaigns = queueQuery.data ?? [];

  if (queueQuery.isPending && campaigns.length === 0) {
    return <ScreenLoadingState message={INTRO_AD_MODERATION_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && campaigns.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error
            ? queueQuery.error.message
            : INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK
        }
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={campaigns as CampaignRow[]}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{INTRO_AD_MODERATION_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => (
        <IntroAdRow
          campaign={item}
          onChanged={() => void queueQuery.refetch()}
          approveMutation={approveMutation}
          rejectMutation={rejectMutation}
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
