import { Pressable, Text, TextInput, View } from "react-native";

import type { SearchSynonymRow } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/entities/product/lib/productCategoryLabels";
import { SynonymCategoryPicker } from "@/features/search-synonyms-admin-page/ui/SynonymCategoryPicker";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "@/shared/config";
import { useAdminPanelStyles } from "@/shared/theme/adminPanelStyles";

type SearchSynonymAdminCardProps = {
  row: SearchSynonymRow;
  isEditing: boolean;
  isPending: boolean;
  editToken: string;
  editCategories: string[];
  onEditTokenChange: (value: string) => void;
  onEditCategoriesChange: (value: string[]) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export const SearchSynonymAdminCard = ({
  row,
  isEditing,
  isPending,
  editToken,
  editCategories,
  onEditTokenChange,
  onEditCategoriesChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: SearchSynonymAdminCardProps) => {
  const styles = useAdminPanelStyles();

  return (
    <View style={[styles.card, isEditing && styles.cardEditing]}>
      <View style={styles.cardBody}>
        {isEditing ? (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_TOKEN}</Text>
              <TextInput
                style={styles.fieldInput}
                value={editToken}
                onChangeText={onEditTokenChange}
                editable={!isPending}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.LABEL_CATEGORIES}</Text>
              <SynonymCategoryPicker
                selected={editCategories}
                onChange={onEditCategoriesChange}
                disabled={isPending}
              />
            </View>
            <View style={styles.editActions}>
              <Pressable
                style={[
                  styles.primaryButton,
                  (isPending || editCategories.length === 0) && styles.primaryButtonDisabled,
                ]}
                disabled={isPending || editCategories.length === 0}
                onPress={onSave}
              >
                <Text style={styles.primaryButtonText}>{SEARCH_SYNONYMS_ADMIN_PAGE_UI.SAVE_BUTTON}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={onCancelEdit} disabled={isPending}>
                <Text style={styles.cancelButtonText}>
                  {SEARCH_SYNONYMS_ADMIN_PAGE_UI.CANCEL_BUTTON}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardTop}>
              <View style={styles.cardMain}>
                <Text style={styles.token}>{row.token}</Text>
                <View style={styles.meta}>
                  {row.categories.map((slug) => (
                    <View key={slug} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {PRODUCT_CATEGORY_LABEL_RU[slug as keyof typeof PRODUCT_CATEGORY_LABEL_RU] ??
                          slug}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable style={styles.secondaryButton} onPress={onStartEdit}>
                  <Text style={styles.secondaryButtonText}>
                    {SEARCH_SYNONYMS_ADMIN_PAGE_UI.EDIT_BUTTON}
                  </Text>
                </Pressable>
                <Pressable style={styles.dangerButton} disabled={isPending} onPress={onDelete}>
                  <Text style={styles.dangerButtonText}>
                    {SEARCH_SYNONYMS_ADMIN_PAGE_UI.DELETE_BUTTON}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
