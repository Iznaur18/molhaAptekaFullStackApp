import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { contractNeedsBuyerAttention } from "@/entities/installment/lib/contractNeedsBuyerAttention";
import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { filterInstallmentBuyerContracts } from "@/entities/installment/lib/filterInstallmentBuyerContracts";
import { summarizeInstallmentBuyerContracts } from "@/entities/installment/lib/summarizeInstallmentBuyerContracts";
import { InstallmentContractCard } from "@/entities/installment/ui/InstallmentContractCard";
import { useMyInstallmentContractsQuery } from "@/entities/installment/model/useMyInstallmentContractsQuery";
import { INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS } from "@/entities/installment/model/constants";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { InstallmentPaymentsOverview } from "@/features/installment-payments-page/ui/InstallmentPaymentsOverview";
import { InstallmentPaymentsPageToolbar } from "@/features/installment-payments-page/ui/InstallmentPaymentsPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { staffBadgeQueryKeys } from "@/shared/api";
import { INSTALLMENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { mergeExpandedRowIds } from "@/shared/lib/mergeExpandedRowIds";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useInstallmentPaymentsPageStyles } from "@/shared/theme/installmentPaymentsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const EMPTY_INSTALLMENT_CONTRACTS: InstallmentContract[] = [];

export const InstallmentPaymentsPage = () => {
  const router = useRouter();
  const styles = useInstallmentPaymentsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const contractsQuery = useMyInstallmentContractsQuery({
    enabled: isAuthorized,
  });

  const allContracts = contractsQuery.data ?? EMPTY_INSTALLMENT_CONTRACTS;
  const summary = useMemo(
    () => summarizeInstallmentBuyerContracts(allContracts),
    [allContracts],
  );
  const contracts = useMemo(
    () => filterInstallmentBuyerContracts(allContracts, { status: statusFilter, attentionOnly }),
    [allContracts, statusFilter, attentionOnly],
  );

  const hasFilters = Boolean(statusFilter) || attentionOnly;
  const countLabel = hasFilters
    ? INSTALLMENT_UI.COUNT_FILTERED(contracts.length, allContracts.length)
    : INSTALLMENT_UI.COUNT_CONTRACTS(allContracts.length);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void contractsQuery.refetch();
      }
    }, [isAuthorized, contractsQuery.refetch]),
  );

  useEffect(() => {
    if (contractsQuery.data == null) {
      return;
    }

    const attentionIds = (contractsQuery.data ?? EMPTY_INSTALLMENT_CONTRACTS)
      .filter(contractNeedsBuyerAttention)
      .map((contract) => String(contract._id));

    setExpandedIds((prev) => mergeExpandedRowIds(prev, attentionIds));
  }, [contractsQuery.data]);

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

  const toggleExpanded = useCallback((contractId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(contracts.map((contract) => String(contract._id))));
  }, [contracts]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleActiveFilterClick = useCallback(() => {
    setStatusFilter(INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

  const emptyMessage = hasFilters
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
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          if (value) {
            setAttentionOnly(false);
          }
        }}
        contractsCountLabel={countLabel}
      />
      <InstallmentPaymentsOverview
        activeCount={summary.activeCount}
        attentionCount={summary.attentionCount}
        totalRemainingRub={summary.totalRemainingRub}
        attentionOnly={attentionOnly}
        onAttentionFilterChange={setAttentionOnly}
        onActiveFilterClick={handleActiveFilterClick}
      />
      {contracts.length > 0 ? (
        <View style={styles.listActions}>
          <Pressable style={styles.listAction} onPress={expandAll}>
            <Text style={styles.listActionText}>{INSTALLMENT_UI.PAYMENTS_EXPAND_ALL}</Text>
          </Pressable>
          <Pressable style={styles.listAction} onPress={collapseAll}>
            <Text style={styles.listActionText}>{INSTALLMENT_UI.PAYMENTS_COLLAPSE_ALL}</Text>
          </Pressable>
          {attentionOnly ? (
            <Text style={styles.filterHint}>{INSTALLMENT_UI.PAYMENTS_ATTENTION_FILTER_HINT}</Text>
          ) : null}
        </View>
      ) : null}
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
        renderItem={({ item }) => {
          const contractId = String(item._id);
          return (
            <InstallmentContractCard
              contract={item}
              role="buyer"
              compact
              collapsible
              expanded={expandedIds.has(contractId)}
              onExpandedChange={() => toggleExpanded(contractId)}
              onProductClick={handleProductClick}
              onCounterpartyClick={handleCounterpartyClick}
              onUpdated={() => {
                void handleRefresh();
              }}
            />
          );
        }}
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
