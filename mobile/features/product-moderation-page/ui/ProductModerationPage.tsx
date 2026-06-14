import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "@/entities/product/ui/ProductCard";
import type { ModerationProduct } from "@/entities/product/api/productModerationApi";
import { usePendingModerationProductsQuery, useProductModerationMutations } from "@/entities/product/model/useProductModerationMutations";
import { getProductSellerDisplayName } from "@/entities/product/lib/getProductSellerDisplayName";
import { PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type ModerationRowProps = {
  product: ModerationProduct;
  onChanged: () => void;
  approveMutation: ReturnType<typeof useProductModerationMutations>["approveMutation"];
  rejectMutation: ReturnType<typeof useProductModerationMutations>["rejectMutation"];
};

const ModerationRow = ({ product, onChanged, approveMutation, rejectMutation }: ModerationRowProps) => {
  const router = useRouter();
  const [rejectComment, setRejectComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const productId = String(product._id);
  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    setErrorMessage("");
    try {
      await approveMutation.mutateAsync(productId);
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING);
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync({ productId, comment: rejectComment });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING);
    }
  };

  return (
    <View style={styles.row}>
      <ProductCard product={product} />
      <Text style={styles.meta}>
        {PRODUCT_MODERATION_PAGE_UI.SELLER_LABEL}: {getProductSellerDisplayName(product)}
      </Text>
      <Pressable onPress={() => router.push(`/product/${productId}`)}>
        <Text style={styles.link}>{product.productName ?? "Товар"}</Text>
      </Pressable>
      <StaffModerationActions
        approveLabel={PRODUCT_MODERATION_PAGE_UI.APPROVE}
        rejectLabel={PRODUCT_MODERATION_PAGE_UI.REJECT}
        pendingLabel={PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING}
        isBusy={isBusy}
        note={rejectComment}
        onNoteChange={setRejectComment}
        notePlaceholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
        onApprove={handleApprove}
        onReject={handleReject}
        errorMessage={errorMessage}
      />
    </View>
  );
};

export const ProductModerationPage = () => {
  const queueQuery = usePendingModerationProductsQuery();
  const { approveMutation, rejectMutation } = useProductModerationMutations();
  const products = queueQuery.data ?? [];

  if (queueQuery.isPending && products.length === 0) {
    return <ScreenLoadingState message={PRODUCT_MODERATION_PAGE_UI.LOADING} />;
  }

  if (queueQuery.isError && products.length === 0) {
    return (
      <ScreenErrorState
        message={queueQuery.error instanceof Error ? queueQuery.error.message : PRODUCT_MODERATION_PAGE_UI.LOADING}
        onRetry={() => void queueQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={queueQuery.isFetching} onRefresh={() => void queueQuery.refetch()} />
      }
      ListEmptyComponent={<Text style={styles.empty}>{PRODUCT_MODERATION_PAGE_UI.EMPTY}</Text>}
      renderItem={({ item }) => (
        <ModerationRow
          product={item}
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
  meta: { fontSize: 13, color: "#666" },
  link: { fontSize: 15, fontWeight: "600", color: "#1565c0" },
  empty: { textAlign: "center", color: "#666", padding: 24 },
});
