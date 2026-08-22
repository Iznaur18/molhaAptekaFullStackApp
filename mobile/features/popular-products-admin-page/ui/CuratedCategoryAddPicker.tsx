import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CuratedCategoryKind } from "@/entities/curated-category-list/api/curatedCategoryListAdminApi";
import { useSellerPersonalCategoryCatalogTilesQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import { POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";
import { useCategoryPickerSheetStyles } from "@/shared/theme/categoryPickerSheetStyles";

type CuratedCategorySelection = {
  kind: CuratedCategoryKind;
  refId: string;
  label: string;
};

type CuratedCategoryAddPickerProps = {
  kind: CuratedCategoryKind;
  onKindChange: (kind: CuratedCategoryKind) => void;
  listRegionCode: string;
  selectedRefId: string;
  selectedLabel: string;
  onSelect: (selection: CuratedCategorySelection) => void;
  disabled?: boolean;
};

export const CuratedCategoryAddPicker = ({
  kind,
  onKindChange,
  listRegionCode,
  selectedRefId,
  selectedLabel,
  onSelect,
  disabled = false,
}: CuratedCategoryAddPickerProps) => {
  const theme = useAppTheme();
  const styles = useAdminPanelStyles();
  const sheet = useCategoryPickerSheetStyles();
  const [personalSheetOpen, setPersonalSheetOpen] = useState(false);

  const personalTilesQuery = useSellerPersonalCategoryCatalogTilesQuery({
    enabled: kind === "personal" && personalSheetOpen,
    regionCode: listRegionCode,
  });
  const personalTiles = personalTilesQuery.data ?? [];

  const renderKindChip = (value: CuratedCategoryKind, label: string) => {
    const active = kind === value;
    return (
      <Pressable
        style={[
          styles.toolbarButton,
          active && styles.toolbarButtonPrimary,
          disabled && styles.toolbarButtonDisabled,
        ]}
        disabled={disabled}
        onPress={() => onKindChange(value)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <Text style={[styles.toolbarButtonText, active && styles.toolbarButtonPrimaryText]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_LABEL}</Text>
      <View style={styles.toolbarActions}>
        {renderKindChip("tree", POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_TREE)}
        {renderKindChip("personal", POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_KIND_PERSONAL)}
      </View>

      {kind === "tree" ? (
        <CreateProductCategoryPicker
          selectedCategoryId={selectedRefId || null}
          selectedCategoryLabel={selectedLabel}
          onSelect={(categoryId, label) =>
            onSelect({ kind: "tree", refId: categoryId, label })
          }
        />
      ) : (
        <>
          <Pressable
            style={[styles.secondaryButton, disabled && styles.primaryButtonDisabled]}
            disabled={disabled}
            onPress={() => setPersonalSheetOpen(true)}
          >
            <Text style={styles.secondaryButtonText} numberOfLines={1}>
              {selectedRefId && selectedLabel
                ? selectedLabel
                : POPULAR_CATEGORIES_ADMIN_PAGE_UI.CATEGORY_PICK_PERSONAL}
            </Text>
          </Pressable>

          <Modal
            visible={personalSheetOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setPersonalSheetOpen(false)}
          >
            <SafeAreaView edges={["top", "bottom"]} style={sheet.sheetRoot}>
              <View style={sheet.sheetHeader}>
                <Text style={sheet.sheetTitle}>
                  {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_SHEET_TITLE}
                </Text>
                <Pressable onPress={() => setPersonalSheetOpen(false)} hitSlop={8}>
                  <Text style={sheet.sheetClose}>
                    {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_SHEET_CLOSE}
                  </Text>
                </Pressable>
              </View>

              {personalTilesQuery.isPending ? (
                <View style={sheet.statusWrap}>
                  <ActivityIndicator size="small" color={theme.colors.textMuted} />
                  <Text style={sheet.statusText}>
                    {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_LOADING}
                  </Text>
                </View>
              ) : personalTilesQuery.isError ? (
                <View style={sheet.statusWrap}>
                  <Text style={sheet.errorText}>
                    {personalTilesQuery.error instanceof Error
                      ? personalTilesQuery.error.message
                      : POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_LOAD_ERROR}
                  </Text>
                </View>
              ) : personalTiles.length === 0 ? (
                <View style={sheet.statusWrap}>
                  <Text style={sheet.statusText}>
                    {POPULAR_CATEGORIES_ADMIN_PAGE_UI.PERSONAL_CATEGORY_EMPTY}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={sheet.list}
                  contentContainerStyle={sheet.listContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {personalTiles.map((tile, index, all) => (
                    <Pressable
                      key={tile._id}
                      style={({ pressed }) => [
                        sheet.row,
                        index === 0 && sheet.rowFirst,
                        index === all.length - 1 && sheet.rowLast,
                        pressed && sheet.rowPressed,
                      ]}
                      onPress={() => {
                        onSelect({ kind: "personal", refId: tile._id, label: tile.labelRu });
                        setPersonalSheetOpen(false);
                      }}
                    >
                      <View style={sheet.rowTextWrap}>
                        <Text style={sheet.rowLabel} numberOfLines={2}>
                          {tile.labelRu}
                        </Text>
                      </View>
                      {selectedRefId === tile._id ? (
                        <Text style={sheet.rowLeafMark}>✓</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </SafeAreaView>
          </Modal>
        </>
      )}
    </View>
  );
};
