import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type CategoryNode = {
  _id: string;
  name?: string;
  labelRu?: string;
  isLeaf?: boolean;
};

type CreateProductCategoryPickerProps = {
  selectedCategoryId: string | null;
  selectedCategoryLabel: string;
  onSelect: (categoryId: string, label: string) => void;
};

const resolveCategoryLabel = (node: CategoryNode) =>
  node.labelRu?.trim() || node.name?.trim() || node._id;

export const CreateProductCategoryPicker = ({
  selectedCategoryId,
  selectedCategoryLabel,
  onSelect,
}: CreateProductCategoryPickerProps) => {
  const theme = useAppTheme();
  const [stack, setStack] = useState<CategoryNode[]>([]);
  const currentParentId = stack.length > 0 ? stack[stack.length - 1]._id : null;

  const rootsQuery = useProductCategoryRootsQuery(stack.length === 0);
  const childrenQuery = useProductCategoryChildrenQuery(currentParentId);

  const categories = useMemo(() => {
    if (stack.length === 0) {
      return (rootsQuery.data ?? []).map((node) => ({
        _id: node.id,
        name: node.labelRu,
        labelRu: node.labelRu,
        isLeaf: node.isLeaf,
      })) as CategoryNode[];
    }
    return (childrenQuery.data?.categories ?? []) as CategoryNode[];
  }, [childrenQuery.data?.categories, rootsQuery.data, stack.length]);

  const isLoading =
    stack.length === 0 ? rootsQuery.isPending : childrenQuery.isPending;

  const handleOpen = (node: CategoryNode) => {
    if (node.isLeaf === true) {
      onSelect(node._id, resolveCategoryLabel(node));
      setStack([]);
      return;
    }
    setStack((prev) => [...prev, node]);
  };

  const handleBack = () => {
    setStack((prev) => prev.slice(0, -1));
  };

  const breadcrumb = stack.map(resolveCategoryLabel).join(" → ");

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {CREATE_PRODUCT_UI.LABEL_CATEGORY}
      </Text>
      <Text style={[styles.selected, { color: theme.colors.textMuted }]}>
        {selectedCategoryLabel || CREATE_PRODUCT_UI.CATEGORY_PLACEHOLDER}
      </Text>

      {stack.length > 0 ? (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.text }]}>
            {CREATE_PRODUCT_UI.CATEGORY_BACK}
            {breadcrumb ? `: ${breadcrumb}` : ""}
          </Text>
        </Pressable>
      ) : null}

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {categories.map((node) => (
            <Pressable
              key={node._id}
              style={[styles.row, { borderColor: theme.colors.border }]}
              onPress={() => handleOpen(node)}
            >
              <Text style={[styles.rowText, { color: theme.colors.text }]}>
                {resolveCategoryLabel(node)}
              </Text>
              <Text style={[styles.rowHint, { color: theme.colors.textMuted }]}>
                {node.isLeaf === true
                  ? CREATE_PRODUCT_UI.CATEGORY_SELECT_LEAF
                  : "→"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {selectedCategoryId ? (
        <Text style={[styles.confirmed, { color: theme.colors.textMuted }]}>
          ID: {selectedCategoryId}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  selected: {
    fontSize: 14,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 8,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
  },
  rowHint: {
    fontSize: 13,
    marginLeft: 8,
  },
  confirmed: {
    fontSize: 12,
  },
});
