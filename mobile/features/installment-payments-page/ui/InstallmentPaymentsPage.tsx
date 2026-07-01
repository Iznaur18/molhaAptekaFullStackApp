import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { InstallmentContractCard } from "@/entities/installment/ui/InstallmentContractCard";
import { useMyInstallmentContractsQuery } from "@/entities/installment/model/useMyInstallmentContractsQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { InstallmentPaymentsPageToolbar } from "@/features/installment-payments-page/ui/InstallmentPaymentsPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { staffBadgeQueryKeys } from "@/shared/api";
import { INSTALLMENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useInstallmentPaymentsPageStyles } from "@/shared/theme/installmentPaymentsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const InstallmentPaymentsPage = () => {
  const router = useRouter();
  const styles = useInstallmentPaymentsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const contractsQuery = useMyInstallmentContractsQuery({
    status: statusFilter,
    enabled: isAuthorized,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void contractsQuery.refetch();
      }
    }, [isAuthorized, contractsQuery.refetch]),
  );

  const invalidateInstallmentQueues = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...staffBadgeQueryKeys.all, "user-actions"],
    });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await contractsQuery.refetch();
    await invalidateInstallmentQueues();
  }, [contractsQuery, invalidateInstallmentQueues]);

  const handleProductClick = useCallback(
    (productId: string) => {
      router.push({ pathname: "/product/[id]", params: { id: productId } });
    },
    [router],
  );

  const handleCounterpartyClick = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const contracts = contractsQuery.data ?? [];
  const emptyMessage = statusFilter
    ? INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY_BY_FILTER
    : INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_PAYMENTS}
        onPress={() => setNavSheetVisible(true)}
      />
      <InstallmentPaymentsPageToolbar
        title={INSTALLMENT_UI.PAYMENTS_PAGE_TITLE}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        contractsCount={contracts.length}
      />
      {contracts.length === 0 ? (
        <Text style={styles.emptyState} accessibilityRole="text">
          {emptyMessage}
        </Text>
      ) : null}
    </View>
  );

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

  if (contractsQuery.isPending) {
    return <ScreenLoadingState message={INSTALLMENT_UI.PAYMENTS_PAGE_LOADING} />;
  }

  if (contractsQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(contractsQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
        onRetry={() => {
          void handleRefresh();
        }}
      />
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        data={contracts}
        keyExtractor={(contract) => contract._id}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={contractsQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <InstallmentContractCard
            contract={item}
            role="buyer"
            compact
            onProductClick={handleProductClick}
            onCounterpartyClick={handleCounterpartyClick}
            onUpdated={() => {
              void handleRefresh();
            }}
          />
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="installment-payments"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
