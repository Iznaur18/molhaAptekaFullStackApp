import { Pressable, Switch, Text, TextInput, View } from "react-native";

import type { ProductCategoryAdminRow } from "@/entities/product-category-tree/model/adminTypes";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/entities/product/lib/productCategoryLabels";
import {
  formatCategoryPath,
  resolveCategoryTreeCardIndent,
} from "@/features/category-tree-admin-page/lib/categoryTreeAdminUtils";
import { CategoryTreeLegacyPicker } from "@/features/category-tree-admin-page/ui/CategoryTreeLegacyPicker";
import { CategoryTreeParentPicker } from "@/features/category-tree-admin-page/ui/CategoryTreeParentPicker";
import { CATEGORY_TREE_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type CategoryTreeAdminCardProps = {
  row: ProductCategoryAdminRow;
  parentOptions: Array<{ id: string; label: string }>;
  isEditing: boolean;
  isPending: boolean;
  editDraft: Record<string, string | boolean>;
  onDraftChange: (patch: Record<string, string | boolean>) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export const CategoryTreeAdminCard = ({
  row,
  parentOptions,
  isEditing,
  isPending,
  editDraft,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: CategoryTreeAdminCardProps) => {
  const styles = useAdminPanelStyles();
  const pathLabel = formatCategoryPath(row);
  const keywords = row.searchKeywords ?? [];
  const indent = resolveCategoryTreeCardIndent(row.depth);

  return (
    <View style={[styles.card, isEditing && styles.cardEditing, { marginLeft: indent }]}>
      <View style={styles.cardBody}>
        {isEditing ? (
          <>
            <View style={styles.editGrid}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_NAME}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={String(editDraft.labelRu ?? "")}
                  onChangeText={(value) => onDraftChange({ labelRu: value })}
                  editable={!isPending}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_SLUG}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={String(editDraft.slug ?? "")}
                  onChangeText={(value) => onDraftChange({ slug: value })}
                  editable={!isPending}
                />
              </View>
              <View style={[styles.field, styles.fieldFull]}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_PARENT}</Text>
                <CategoryTreeParentPicker
                  value={String(editDraft.parentId ?? "")}
                  options={parentOptions.filter((item) => item.id !== row._id)}
                  onChange={(value) => onDraftChange({ parentId: value })}
                  disabled={isPending}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEAF}</Text>
                <Switch
                  value={editDraft.isLeaf === true}
                  onValueChange={(value) => onDraftChange({ isLeaf: value })}
                  disabled={isPending}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_LEGACY}</Text>
                <CategoryTreeLegacyPicker
                  value={String(editDraft.legacyProductCategory ?? "")}
                  onChange={(value) => onDraftChange({ legacyProductCategory: value })}
                  disabled={isPending}
                />
              </View>
              <View style={[styles.field, styles.fieldFull]}>
                <Text style={styles.fieldLabel}>{CATEGORY_TREE_ADMIN_PAGE_UI.LABEL_KEYWORDS}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={String(editDraft.keywordsCsv ?? "")}
                  onChangeText={(value) => onDraftChange({ keywordsCsv: value })}
                  placeholder={CATEGORY_TREE_ADMIN_PAGE_UI.KEYWORDS_PLACEHOLDER}
                  editable={!isPending}
                />
              </View>
            </View>
            <View style={styles.editActions}>
              <Pressable
                style={[styles.primaryButton, isPending && styles.primaryButtonDisabled]}
                disabled={isPending}
                onPress={onSave}
              >
                <Text style={styles.primaryButtonText}>{CATEGORY_TREE_ADMIN_PAGE_UI.SAVE_BUTTON}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={onCancelEdit} disabled={isPending}>
                <Text style={styles.secondaryButtonText}>
                  {CATEGORY_TREE_ADMIN_PAGE_UI.CANCEL_BUTTON}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.cardTop}>
            <View style={styles.cardMain}>
              <Text style={styles.path}>{pathLabel}</Text>
              <Text style={styles.slug}>{row.slug}</Text>
              <View style={styles.meta}>
                <View style={[styles.chip, row.isLeaf ? styles.chipLeaf : styles.chipBranch]}>
                  <Text style={[styles.chipText, row.isLeaf ? styles.chipLeafText : styles.chipBranchText]}>
                    {row.isLeaf
                      ? CATEGORY_TREE_ADMIN_PAGE_UI.LEAF_BADGE
                      : CATEGORY_TREE_ADMIN_PAGE_UI.BRANCH_BADGE}
                  </Text>
                </View>
                {row.legacyProductCategory ? (
                  <View style={[styles.chip, styles.chipNeutral]}>
                    <Text style={styles.chipNeutralText}>
                      {PRODUCT_CATEGORY_LABEL_RU[
                        row.legacyProductCategory as keyof typeof PRODUCT_CATEGORY_LABEL_RU
                      ] ?? row.legacyProductCategory}
                    </Text>
                  </View>
                ) : null}
              </View>
              {keywords.length > 0 ? (
                <Text style={styles.keywords}>{keywords.join(" · ")}</Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <Pressable style={styles.secondaryButton} onPress={onStartEdit}>
                <Text style={styles.secondaryButtonText}>
                  {CATEGORY_TREE_ADMIN_PAGE_UI.EDIT_BUTTON}
                </Text>
              </Pressable>
              <Pressable style={styles.dangerButton} disabled={isPending} onPress={onDelete}>
                <Text style={styles.dangerButtonText}>
                  {CATEGORY_TREE_ADMIN_PAGE_UI.DELETE_BUTTON}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
