import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { InstallmentContractCard } from "@/entities/installment/ui/InstallmentContractCard";
import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "@/entities/installment/model/constants";
import { useMyInstallmentSalesQuery } from "@/entities/installment/model/useMyInstallmentSalesQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useOrdersScreenStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const InstallmentSalesPage = () => {
  const router = useRouter();
  const styles = useOrdersScreenStyles();
  const isAuthorized = useIsAuthorized();
  const [statusFilter, setStatusFilter] = useState("");
  const salesQuery = useMyInstallmentSalesQuery({
    status: statusFilter,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{INSTALLMENT_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{INSTALLMENT_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (salesQuery.isPending) {
    return <ScreenLoadingState message={INSTALLMENT_UI.SALES_PAGE_LOADING} />;
  }

  if (salesQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(salesQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
        onRetry={() => salesQuery.refetch()}
      />
    );
  }

  const contracts = salesQuery.data ?? [];

  return (
    <FlatList
      data={contracts}
      keyExtractor={(contract) => contract._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <ThemedRefreshControl refreshing={salesQuery.isRefetching} onRefresh={salesQuery.refetch} />
      }
      ListHeaderComponent={
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS.map((filter) => {
            const isActive = statusFilter === filter.value;
            const label = INSTALLMENT_UI[filter.labelKey];
            return (
              <Pressable
                key={filter.value || "all"}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.hint}>
            {statusFilter
              ? INSTALLMENT_UI.SALES_PAGE_EMPTY_BY_FILTER
              : INSTALLMENT_UI.SALES_PAGE_EMPTY}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <InstallmentContractCard
          contract={item}
          role="seller"
          onProductPress={(productId) => router.push(`/product/${productId}`)}
        />
      )}
    />
  );
};
