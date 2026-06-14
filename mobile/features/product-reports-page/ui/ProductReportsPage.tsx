import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
} from "@/entities/product-report/model/constants";
import type { ProductReportGroup } from "@/entities/product-report/api/productReportStaffApi";
import {
  usePendingProductReportsQuery,
  useResolveProductReportsMutation,
} from "@/entities/product-report/model/useProductReportStaffMutations";
import { usePendingUserStoryReportsQuery } from "@/entities/user-story/model/useUserStoryReportStaffMutations";
import { UserStoryReportGroupRow } from "@/features/product-reports-page/ui/UserStoryReportGroupRow";
import { PRODUCT_REPORTS_PAGE_UI } from "@/shared/config";
import { StaffModerationActions } from "@/shared/ui/StaffModerationActions";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type SectionFilter = "" | "products" | "stories";

type RowProps = {
  group: ProductReportGroup;
  onChanged: () => void;
  resolveMutation: ReturnType<typeof useResolveProductReportsMutation>;
};

const ReportGroupRow = ({ group, onChanged, resolveMutation }: RowProps) => {
  const router = useRouter();
  const [staffNote, setStaffNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const productId = String(group.product._id);
  const isBusy = resolveMutation.isPending;

  const resolve = async (resolution: string) => {
    const note = staffNote.trim();
    if (!note) {
      setErrorMessage("Укажите комментарий staff");
      return;
    }
    setErrorMessage("");
    try {
      await resolveMutation.mutateAsync({ productId, body: { resolution, staffNote: note } });
      onChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : PRODUCT_REPORTS_PAGE_UI.ACTION_PENDING);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{group.product.productName ?? "Товар"}</Text>
      <Text style={styles.meta}>{PRODUCT_REPORTS_PAGE_UI.REPORTS_COUNT_LABEL(group.reportCount)}</Text>
      <Pressable onPress={() => router.push(`/product/${productId}`)}>
        <Text style={styles.link}>{PRODUCT_REPORTS_PAGE_UI.OPEN_PRODUCT}</Text>
      </Pressable>
      <StaffModerationActions
        approveLabel={PRODUCT_REPORTS_PAGE_UI.ACTION_DISMISS}
        rejectLabel={PRODUCT_REPORTS_PAGE_UI.ACTION_HIDE}
        pendingLabel={PRODUCT_REPORTS_PAGE_UI.ACTION_PENDING}
        isBusy={isBusy}
        note={staffNote}
        onNoteChange={setStaffNote}
        notePlaceholder={PRODUCT_REPORTS_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
        onApprove={() => void resolve(PRODUCT_REPORT_RESOLUTION_DISMISS)}
        onReject={() => void resolve(PRODUCT_REPORT_RESOLUTION_HIDE)}
        errorMessage={errorMessage}
      />
      <Pressable
        style={styles.rejectProductButton}
        onPress={() => void resolve(PRODUCT_REPORT_RESOLUTION_REJECT)}
        disabled={isBusy}
      >
        <Text style={styles.rejectProductText}>{PRODUCT_REPORTS_PAGE_UI.ACTION_REJECT}</Text>
      </Pressable>
    </View>
  );
};

const FILTER_OPTIONS: Array<{ value: SectionFilter; label: string }> = [
  { value: "", label: PRODUCT_REPORTS_PAGE_UI.SECTION_FILTER_ALL },
  { value: "products", label: PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS },
  { value: "stories", label: PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES },
];

export const ProductReportsPage = () => {
  const productReportsQuery = usePendingProductReportsQuery();
  const storyReportsQuery = usePendingUserStoryReportsQuery();
  const resolveMutation = useResolveProductReportsMutation();

  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("");

  const productGroups = productReportsQuery.data?.groups ?? [];
  const storyGroups = storyReportsQuery.data?.groups ?? [];
  const isLoading = productReportsQuery.isPending || storyReportsQuery.isPending;
  const queryError = productReportsQuery.error ?? storyReportsQuery.error;

  const visibleProductGroups = sectionFilter === "stories" ? [] : productGroups;
  const visibleStoryGroups = sectionFilter === "products" ? [] : storyGroups;
  const visibleCount = visibleProductGroups.length + visibleStoryGroups.length;

  const reloadQueue = () => {
    void productReportsQuery.refetch();
    void storyReportsQuery.refetch();
  };

  const listData = useMemo(
    () => [
      ...visibleProductGroups.map((group) => ({ type: "product" as const, group })),
      ...visibleStoryGroups.map((group) => ({ type: "story" as const, group })),
    ],
    [visibleProductGroups, visibleStoryGroups],
  );

  if (isLoading && productGroups.length === 0 && storyGroups.length === 0) {
    return <ScreenLoadingState message={PRODUCT_REPORTS_PAGE_UI.LOADING} />;
  }

  if (queryError && productGroups.length === 0 && storyGroups.length === 0) {
    return (
      <ScreenErrorState
        message={queryError instanceof Error ? queryError.message : PRODUCT_REPORTS_PAGE_UI.LOADING}
        onRetry={reloadQueue}
      />
    );
  }

  const emptyMessage =
    productGroups.length + storyGroups.length === 0
      ? PRODUCT_REPORTS_PAGE_UI.EMPTY
      : sectionFilter
        ? PRODUCT_REPORTS_PAGE_UI.EMPTY_BY_FILTER
        : PRODUCT_REPORTS_PAGE_UI.EMPTY;

  return (
    <FlatList
      data={listData}
      keyExtractor={(item) =>
        item.type === "product"
          ? `product-${String(item.group.product._id)}`
          : `story-${String(item.group.story._id)}`
      }
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={productReportsQuery.isFetching || storyReportsQuery.isFetching}
          onRefresh={reloadQueue}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.heading}>{PRODUCT_REPORTS_PAGE_UI.TITLE}</Text>
          <Text style={styles.count}>{PRODUCT_REPORTS_PAGE_UI.COUNT(visibleCount)}</Text>
          <View style={styles.chips}>
            {FILTER_OPTIONS.map((option) => (
              <Pressable
                key={option.value || "all"}
                style={[styles.chip, sectionFilter === option.value && styles.chipSelected]}
                onPress={() => setSectionFilter(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    sectionFilter === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {visibleProductGroups.length > 0 ? (
            <Text style={styles.sectionTitle}>{PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>{emptyMessage}</Text>}
      renderItem={({ item, index }) => {
        const showStoryHeader =
          item.type === "story" &&
          visibleStoryGroups.length > 0 &&
          (index === 0 || listData[index - 1]?.type === "product");

        return (
          <View>
            {showStoryHeader ? (
              <Text style={styles.sectionTitle}>{PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}</Text>
            ) : null}
            {item.type === "product" ? (
              <ReportGroupRow
                group={item.group}
                onChanged={reloadQueue}
                resolveMutation={resolveMutation}
              />
            ) : (
              <UserStoryReportGroupRow group={item.group} onChanged={reloadQueue} />
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 12, gap: 16, paddingBottom: 32 },
  header: { gap: 10, marginBottom: 8 },
  heading: { fontSize: 18, fontWeight: "700" },
  count: { fontSize: 13, color: "#666" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: { borderColor: "#1f6feb", backgroundColor: "#e8f1ff" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextSelected: { color: "#1f6feb", fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginTop: 8, marginBottom: 4 },
  row: { gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 13, color: "#666" },
  link: { fontSize: 14, color: "#1565c0" },
  empty: { textAlign: "center", color: "#666", padding: 24 },
  rejectProductButton: {
    backgroundColor: "#6d4c41",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectProductText: { color: "#fff", fontWeight: "600" },
});
