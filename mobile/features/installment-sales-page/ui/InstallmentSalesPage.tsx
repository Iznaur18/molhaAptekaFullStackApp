import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { contractNeedsSellerAttention } from "@/entities/installment/lib/contractNeedsSellerAttention";
import type { InstallmentContract } from "@/entities/installment/api/installmentApi";
import { filterInstallmentSellerContracts } from "@/entities/installment/lib/filterInstallmentSellerContracts";
import { summarizeInstallmentSellerContracts } from "@/entities/installment/lib/summarizeInstallmentSellerContracts";
import { InstallmentContractCard } from "@/entities/installment/ui/InstallmentContractCard";
import { useMyInstallmentSalesQuery } from "@/entities/installment/model/useMyInstallmentSalesQuery";
import { INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS } from "@/entities/installment/model/constants";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { InstallmentPaymentsOverview } from "@/features/installment-payments-page/ui/InstallmentPaymentsOverview";
import { InstallmentPaymentsPageToolbar } from "@/features/installment-payments-page/ui/InstallmentPaymentsPageToolbar";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { staffBadgeQueryKeys } from "@/shared/api";
import { INSTALLMENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { mergeExpandedRowIds } from "@/shared/lib/mergeExpandedRowIds";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useInstallmentPaymentsPageStyles } from "@/shared/theme/installmentPaymentsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const EMPTY_INSTALLMENT_CONTRACTS: InstallmentContract[] = [];

export const InstallmentSalesPage = () => {
  const router = useRouter();
  const styles = useInstallmentPaymentsPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const salesQuery = useMyInstallmentSalesQuery({
    enabled: isAuthorized,
  });

  const allContracts = salesQuery.data ?? EMPTY_INSTALLMENT_CONTRACTS;
  const summary = useMemo(
    () => summarizeInstallmentSellerContracts(allContracts),
    [allContracts],
  );
  const contracts = useMemo(
    () => filterInstallmentSellerContracts(allContracts, { status: statusFilter, attentionOnly }),
    [allContracts, statusFilter, attentionOnly],
  );

  const hasFilters = Boolean(statusFilter) || attentionOnly;
  const countLabel = hasFilters
    ? INSTALLMENT_UI.COUNT_FILTERED(contracts.length, allContracts.length)
    : INSTALLMENT_UI.COUNT_CONTRACTS(allContracts.length);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void salesQuery.refetch();
      }
    }, [isAuthorized, salesQuery.refetch]),
  );

  useEffect(() => {
    if (salesQuery.data == null) {
      return;
    }

    const attentionIds = (salesQuery.data ?? EMPTY_INSTALLMENT_CONTRACTS)
      .filter(contractNeedsSellerAttention)
      .map((contract) => String(contract._id));

    setExpandedIds((prev) => mergeExpandedRowIds(prev, attentionIds));
  }, [salesQuery.data]);

  const invalidateInstallmentQueues = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...staffBadgeQueryKeys.all, "user-actions"],
    });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await salesQuery.refetch();
    await invalidateInstallmentQueues();
  }, [salesQuery, invalidateInstallmentQueues]);

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
    ? INSTALLMENT_UI.SALES_PAGE_EMPTY_BY_FILTER
    : INSTALLMENT_UI.SALES_PAGE_EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_SALES}
        onPress={() => setNavSheetVisible(true)}
      />
      <InstallmentPaymentsPageToolbar
        title={INSTALLMENT_UI.SALES_PAGE_TITLE}
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
        remainingLabel={INSTALLMENT_UI.SALES_OVERVIEW_REMAINING}
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
            <Text style={styles.filterHint}>{INSTALLMENT_UI.SALES_ATTENTION_FILTER_HINT}</Text>
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

  if (salesQuery.isPending) {
    return <ScreenLoadingState message={INSTALLMENT_UI.SALES_PAGE_LOADING} />;
  }

  if (salesQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(salesQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
        onRetry={() => {
          void handleRefresh();
        }}
      />
    );
  }

  return (
    <>
      <ProfileAccountList
        data={contracts}
        keyExtractor={(contract) => contract._id}
        style={[
          styles.container,
          scrollEnabled ? styles.listFlex : null,
          scrollEnabled ? centeredContentStyle : null,
        ]}
        contentContainerStyle={[
          styles.list,
          !isDrawerLayout ? styles.listInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={salesQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => {
          const contractId = String(item._id);
          return (
            <View style={index === 0 ? styles.listItemFirst : styles.listItem}>
              <InstallmentContractCard
                contract={item}
                role="seller"
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
            </View>
          );
        }}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="installment-sales"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
