import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { StaffProductPromotionRow } from "@/entities/product-promotion/api/productPromotionStaffApi";
import {
  usePendingProductPromotionsQuery,
  useProductPromotionStaffMutations,
} from "@/entities/product-promotion/model/useProductPromotionStaffMutations";
import { PRODUCT_PROMOTIONS_STAFF_PAGE_UI } from "@/shared/config";
import { useStaffQueueStyles } from "@/shared/theme/staffQueueStyles";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PAYMENT_METHOD_POINTS = "points";
const PAYMENT_METHOD_RUB = "rub";

const formatPaymentLabel = (paymentMethod?: string) => {
  if (paymentMethod === PAYMENT_METHOD_RUB) {
    return PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_RUB;
  }
  if (paymentMethod === PAYMENT_METHOD_POINTS) {
    return PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PAYMENT_POINTS;
  }
  return "—";
};

type RowProps = {
  promotion: StaffProductPromotionRow;
  onChanged: () => void;
  approveMutation: ReturnType<typeof useProductPromotionStaffMutations>["approveMutation"];
  rejectMutation: ReturnType<typeof useProductPromotionStaffMutations>["rejectMutation"];
};

const PromotionRow = ({ promotion, onChanged, approveMutation, rejectMutation }: RowProps) => {
  const styles = useStaffQueueStyles();
  const [errorMessage, setErrorMessage] = useState("");
  const promotionId = String(promotion._id);
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    setErrorMessage("");
    try {
      await approveMutation.mutateAsync(promotionId);
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PENDING,
      );
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync(promotionId);
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PENDING,
      );
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRODUCT}: {promotion.productName ?? "—"}
      </Text>
      <Text style={styles.meta}>
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_TARIFF}: {promotion.tariffTitle ?? "—"}
      </Text>
      <Text style={styles.meta}>
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PRICE}: {promotion.amountRub ?? "—"}
      </Text>
      {promotion.paymentMethod === PAYMENT_METHOD_POINTS ? (
        <Text style={styles.meta}>
          {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_POINTS}: {promotion.amountPoints ?? "—"}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {PRODUCT_PROMOTIONS_STAFF_PAGE_UI.ROW_PAYMENT}: {formatPaymentLabel(promotion.paymentMethod)}
      </Text>
      <Text style={styles.meta}>Продавец: {promotion.seller?.userName ?? "—"}</Text>
      <StaffModerationActions
        approveLabel={PRODUCT_PROMOTIONS_STAFF_PAGE_UI.APPROVE}
        rejectLabel={PRODUCT_PROMOTIONS_STAFF_PAGE_UI.REJECT}
        pendingLabel={PRODUCT_PROMOTIONS_STAFF_PAGE_UI.PENDING}
        isBusy={isBusy}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const ProductPromotionsStaffPage = () => {
  const styles = useStaffQueueStyles();
  const queueQuery = usePendingProductPromotionsQuery();
  const { approveMutation, rejectMutation } = useProductPromotionStaffMutations();
  const promotions = queueQuery.data ?? [];

  if (queueQuery.isPending && promotions.length === 0) {
    return <ScreenLoadingState message={PRODUCT_PROMOTIONS_STAFF_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && promotions.length === 0) {
    return (
      <ScreenErrorState
        message={
          queueQuery.error instanceof Error
            ? queueQuery.error.message
            : PRODUCT_PROMOTIONS_STAFF_PAGE_UI.LOADING
        }
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={promotions}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{PRODUCT_PROMOTIONS_STAFF_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => (
        <PromotionRow
          promotion={item}
          onChanged={() => void queueQuery.refetch()}
          approveMutation={approveMutation}
          rejectMutation={rejectMutation}
        />
      )}
    />
  );
};
