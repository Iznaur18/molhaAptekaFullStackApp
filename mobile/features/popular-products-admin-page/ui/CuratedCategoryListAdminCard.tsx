import { useCallback, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";
import { Pressable, Text, TextInput, View } from "react-native";

import type {
  CuratedCategoryKind,
  CuratedCategoryListAdminRow,
} from "@/entities/curated-category-list/api/curatedCategoryListAdminApi";
import { resolveCuratedAddCategoryBlockReason } from "@/entities/curated-category-list/lib/resolveCuratedAddCategoryBlockReason";
import { useCuratedListCategoryAddPreview } from "@/entities/curated-category-list/model/useCuratedListCategoryAddPreview";
import { RuRegionSelect } from "@/entities/region/ui/RuRegionSelect";
import { CuratedCategoryAddPicker } from "@/features/popular-products-admin-page/ui/CuratedCategoryAddPicker";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type CuratedCategoryListAdminCardProps = {
  list: CuratedCategoryListAdminRow;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDeleteList: () => void;
  onSaveList: (payload: { title: string; regionCode: string }) => Promise<void>;
  onAddCategory: (payload: { kind: CuratedCategoryKind; refId: string }) => Promise<void>;
  onRemoveCategory: (itemKey: string) => Promise<void>;
};

export const CuratedCategoryListAdminCard = ({
  list,
  isFirst,
  isLast,
  isBusy,
  onMoveUp,
  onMoveDown,
  onDeleteList,
  onSaveList,
  onAddCategory,
  onRemoveCategory,
}: CuratedCategoryListAdminCardProps) => {
  const styles = useAdminPanelStyles();
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [regionDraft, setRegionDraft] = useState(
    list.regionCode || DEFAULT_VIEWER_REGION_CODE,
  );
  const [kindDraft, setKindDraft] = useState<CuratedCategoryKind>("tree");
  const [refIdDraft, setRefIdDraft] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [localError, setLocalError] = useState("");

  const {
    preview,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useCuratedListCategoryAddPreview(kindDraft, refIdDraft);

  const listRegionCode = list.regionCode || DEFAULT_VIEWER_REGION_CODE;
  const regionBlockReason = resolveCuratedAddCategoryBlockReason({
    preview,
    listRegionCode: regionDraft || listRegionCode,
  });
  const canAddCategory =
    Boolean(preview) && !isPreviewLoading && !previewError && regionBlockReason == null;

  const handleSaveList = useCallback(async () => {
    setLocalError("");
    if (!regionDraft) {
      setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.REGION_REQUIRED);
      return;
    }
    try {
      await onSaveList({ title: titleDraft, regionCode: regionDraft });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  }, [onSaveList, regionDraft, titleDraft]);

  const handleAddCategory = useCallback(async () => {
    setLocalError("");
    const refId = refIdDraft.trim();
    if (!refId) {
      setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_REQUIRED);
      return;
    }
    if (!canAddCategory) {
      if (regionBlockReason === "catalog") {
        setLocalError(POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE);
      } else if (typeof regionBlockReason === "string") {
        setLocalError(regionBlockReason);
      } else if (previewError) {
        setLocalError(previewError);
      }
      return;
    }
    try {
      await onAddCategory({ kind: kindDraft, refId });
      setRefIdDraft("");
      setSelectedLabel("");
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : POPULAR_CATEGORIES_ADMIN_PAGE_UI.ADD_ITEM_ERROR,
      );
    }
  }, [canAddCategory, kindDraft, onAddCategory, previewError, refIdDraft, regionBlockReason]);

  const handleRemoveCategory = useCallback(
    async (itemKey: string) => {
      setLocalError("");
      try {
        await onRemoveCategory(itemKey);
      } catch (error) {
        setLocalError(
          error instanceof Error
            ? error.message
            : POPULAR_CATEGORIES_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR,
        );
      }
    },
    [onRemoveCategory],
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.curatedCardHeader}>
          <View style={styles.orderRow}>
            <Pressable
              style={[styles.orderButton, (isBusy || isFirst) && styles.orderButtonDisabled]}
              onPress={onMoveUp}
              disabled={isBusy || isFirst}
              accessibilityRole="button"
              accessibilityLabel={POPULAR_CATEGORIES_ADMIN_PAGE_UI.MOVE_UP_ARIA}
            >
              <Text style={styles.orderButtonText}>↑</Text>
            </Pressable>
            <Pressable
              style={[styles.orderButton, (isBusy || isLast) && styles.orderButtonDisabled]}
              onPress={onMoveDown}
              disabled={isBusy || isLast}
              accessibilityRole="button"
              accessibilityLabel={POPULAR_CATEGORIES_ADMIN_PAGE_UI.MOVE_DOWN_ARIA}
            >
              <Text style={styles.orderButtonText}>↓</Text>
            </Pressable>
          </View>
          <Pressable style={styles.dangerButton} onPress={onDeleteList} disabled={isBusy}>
            <Text style={styles.dangerButtonText}>
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_LIST}
            </Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_TITLE_LABEL}</Text>
          <TextInput
            style={styles.fieldInput}
            value={titleDraft}
            maxLength={60}
            onChangeText={setTitleDraft}
            editable={!isBusy}
          />
        </View>
        <RuRegionSelect
          value={regionDraft}
          onChange={setRegionDraft}
          disabled={isBusy}
          label={POPULAR_CATEGORIES_ADMIN_PAGE_UI.LIST_REGION_LABEL}
          required
        />
        <Pressable
          style={[
            styles.secondaryButton,
            (isBusy || titleDraft.trim() === "" || !regionDraft) && styles.primaryButtonDisabled,
          ]}
          onPress={() => void handleSaveList()}
          disabled={isBusy || titleDraft.trim() === "" || !regionDraft}
        >
          <Text style={styles.secondaryButtonText}>
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.SAVE_TITLE}
          </Text>
        </Pressable>

        <CuratedCategoryAddPicker
          kind={kindDraft}
          onKindChange={(nextKind) => {
            setKindDraft(nextKind);
            setRefIdDraft("");
            setSelectedLabel("");
            setLocalError("");
          }}
          listRegionCode={regionDraft || listRegionCode}
          selectedRefId={refIdDraft}
          selectedLabel={selectedLabel}
          onSelect={({ kind, refId, label }) => {
            setKindDraft(kind);
            setRefIdDraft(refId);
            setSelectedLabel(label);
            setLocalError("");
          }}
          disabled={isBusy}
        />

        {isPreviewLoading ? (
          <Text style={[styles.alert, styles.alertInfo]}>
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_LOADING}
          </Text>
        ) : null}

        {previewError ? (
          <Text style={[styles.alert, styles.alertError]} accessibilityRole="alert">
            {previewError}
          </Text>
        ) : null}

        {preview && !isPreviewLoading ? (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NAME_LABEL}: {preview.label}
            </Text>
            {preview.kind === "personal" && preview.regionLabel ? (
              <Text style={styles.fieldLabel}>
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_REGION_LABEL}: {preview.regionLabel}
              </Text>
            ) : null}
            {regionBlockReason === "catalog" ? (
              <Text style={[styles.alert, styles.alertError]}>
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE}
              </Text>
            ) : typeof regionBlockReason === "string" ? (
              <Text style={[styles.alert, styles.alertError]}>{regionBlockReason}</Text>
            ) : (
              <Text style={[styles.alert, styles.alertInfo]}>
                {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_OK}
              </Text>
            )}
          </View>
        ) : null}

        <Pressable
          style={[styles.primaryButton, (isBusy || !canAddCategory) && styles.primaryButtonDisabled]}
          onPress={() => void handleAddCategory()}
          disabled={isBusy || !canAddCategory}
        >
          <Text style={styles.primaryButtonText}>
            {POPULAR_CATEGORIES_ADMIN_PAGE_UI.ADD_CATEGORY}
          </Text>
        </Pressable>

        {localError ? (
          <Text style={[styles.alert, styles.alertError]} accessibilityRole="alert">
            {localError}
          </Text>
        ) : null}

        {list.items.length === 0 ? (
          <Text style={styles.emptyList}>{POPULAR_CATEGORIES_ADMIN_PAGE_UI.EMPTY_LIST}</Text>
        ) : (
          <View style={styles.productItems}>
            {list.items.map((item) => (
              <View key={item.itemKey} style={styles.productItemRow}>
                <Text style={styles.productIdText}>
                  {item.kind === "personal"
                    ? POPULAR_CATEGORIES_ADMIN_PAGE_UI.ITEM_KIND_PERSONAL
                    : POPULAR_CATEGORIES_ADMIN_PAGE_UI.ITEM_KIND_TREE}
                  {" · "}
                  {item.refId}
                </Text>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => void handleRemoveCategory(item.itemKey)}
                  disabled={isBusy}
                >
                  <Text style={styles.secondaryButtonText}>
                    {POPULAR_CATEGORIES_ADMIN_PAGE_UI.REMOVE_CATEGORY}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
