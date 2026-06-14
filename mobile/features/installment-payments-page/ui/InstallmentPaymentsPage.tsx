import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { InstallmentContractCard } from "@/entities/installment/ui/InstallmentContractCard";
import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "@/entities/installment/model/constants";
import { useMyInstallmentContractsQuery } from "@/entities/installment/model/useMyInstallmentContractsQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { INSTALLMENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const InstallmentPaymentsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const [statusFilter, setStatusFilter] = useState("");
  const contractsQuery = useMyInstallmentContractsQuery({
    status: statusFilter,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {INSTALLMENT_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{INSTALLMENT_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (contractsQuery.isPending) {
    return <ScreenLoadingState message={INSTALLMENT_UI.PAYMENTS_PAGE_LOADING} />;
  }

  if (contractsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(contractsQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
        onRetry={() => contractsQuery.refetch()}
      />
    );
  }

  const contracts = contractsQuery.data ?? [];

  return (
    <FlatList
      data={contracts}
      keyExtractor={(contract) => contract._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={contractsQuery.isRefetching}
          onRefresh={contractsQuery.refetch}
        />
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
                style={[
                  styles.filterChip,
                  { borderColor: theme.colors.border },
                  isActive && { backgroundColor: theme.colors.nearBlack },
                ]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? "#fff" : theme.colors.text },
                  ]}
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
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {statusFilter
              ? INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY_BY_FILTER
              : INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <InstallmentContractCard
          contract={item}
          role="buyer"
          onProductPress={(productId) => router.push(`/product/${productId}`)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  filters: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
