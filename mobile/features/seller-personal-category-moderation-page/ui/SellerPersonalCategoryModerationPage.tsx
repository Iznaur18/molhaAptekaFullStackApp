import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import {
  usePendingSellerPersonalCategoryCampaignsQuery,
  useSellerPersonalCategoryModerationMutations,
} from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "@/shared/config";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type CampaignRow = Record<string, unknown> & {
  _id: string;
  categoryName?: string;
  tileImageUrl?: string;
  seller?: { userName?: string } | null;
};

type RowProps = {
  campaign: CampaignRow;
  onChanged: () => void;
  approveMutation: ReturnType<
    typeof useSellerPersonalCategoryModerationMutations
  >["approveMutation"];
  rejectMutation: ReturnType<
    typeof useSellerPersonalCategoryModerationMutations
  >["rejectMutation"];
};

const CategoryRow = ({ campaign, onChanged, approveMutation, rejectMutation }: RowProps) => {
  const styles = useStaffQueueStyles();
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
      setErrorMessage(
        error instanceof Error ? error.message : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
      );
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync({ campaignId, reason });
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
      );
    }
  };

  return (
    <View style={styles.row}>
      {campaign.tileImageUrl ? (
        <Image source={{ uri: String(campaign.tileImageUrl) }} style={styles.thumb} />
      ) : null}
      <Text style={styles.title}>{campaign.categoryName ?? "Категория"}</Text>
      <Text style={styles.meta}>
        {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}:{" "}
        {campaign.seller?.userName ?? "—"}
      </Text>
      <StaffModerationActions
        approveLabel={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE}
        rejectLabel={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT}
        pendingLabel={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE}
        isBusy={isBusy}
        note={reason}
        onNoteChange={setReason}
        notePlaceholder={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const SellerPersonalCategoryModerationPage = () => {
  const styles = useStaffQueueStyles();
  const queueQuery = usePendingSellerPersonalCategoryCampaignsQuery();
  const { approveMutation, rejectMutation } = useSellerPersonalCategoryModerationMutations();
  const campaigns = queueQuery.data ?? [];

  if (queueQuery.isPending && campaigns.length === 0) {
    return <ScreenLoadingState message={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && campaigns.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error
            ? queueQuery.error.message
            : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK
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
        <ThemedRefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>{SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.EMPTY}</Text>
      }
      renderItem={({ item }) => (
        <CategoryRow
          campaign={item}
          onChanged={() => void queueQuery.refetch()}
          approveMutation={approveMutation}
          rejectMutation={rejectMutation}
        />
      )}
    />
  );
};
