import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useProductCategoryChildrenQuery } from "@/entities/product-category-tree/model/useProductCategoryChildrenQuery";
import { useProductCategoryRootsQuery } from "@/entities/product-category-tree/model/useProductCategoryRootsQuery";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryNode = {
  id: string;
  labelRu: string;
  isLeaf: boolean;
  legacyProductCategory?: string | null;
};

type TrailItem = {
  id: string;
  labelRu: string;
};

export type CreateProductCategoryPickerProps = {
  selectedCategoryId: string | null;
  selectedCategoryLabel: string;
  onSelect: (categoryId: string, label: string) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeRootNode = (raw: Record<string, unknown>): CategoryNode => ({
  id: String(raw.id ?? raw._id ?? ""),
  labelRu: String(raw.labelRu ?? raw.name ?? ""),
  isLeaf: raw.isLeaf === true,
  legacyProductCategory:
    typeof raw.legacyProductCategory === "string" ? raw.legacyProductCategory : null,
});

const normalizeChildNode = (raw: Record<string, unknown>): CategoryNode => ({
  id: String(raw.id ?? raw._id ?? ""),
  labelRu: String(raw.labelRu ?? raw.name ?? ""),
  isLeaf: raw.isLeaf === true,
  legacyProductCategory:
    typeof raw.legacyProductCategory === "string" ? raw.legacyProductCategory : null,
});

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateProductCategoryPicker = ({
  selectedCategoryId,
  selectedCategoryLabel,
  onSelect,
}: CreateProductCategoryPickerProps) => {
  const theme = useAppTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trail, setTrail] = useState<TrailItem[]>([]);

  const isRoot = trail.length === 0;
  const activeParentId = isRoot ? null : trail[trail.length - 1].id;

  const rootsQuery = useProductCategoryRootsQuery(!selectedCategoryId);
  const childrenQuery = useProductCategoryChildrenQuery(activeParentId);

  const options = useMemo<CategoryNode[]>(() => {
    if (isRoot) {
      return (rootsQuery.data ?? []).map((n) =>
        normalizeRootNode(n as unknown as Record<string, unknown>),
      );
    }
    return ((childrenQuery.data as { categories?: unknown[] } | null)?.categories ?? []).map(
      (n) => normalizeChildNode(n as Record<string, unknown>),
    );
  }, [isRoot, rootsQuery.data, childrenQuery.data]);

  const isLoading = isRoot ? rootsQuery.isPending : childrenQuery.isPending;
  const loadError =
    (rootsQuery.error instanceof Error ? rootsQuery.error.message : "") ||
    (childrenQuery.error instanceof Error ? childrenQuery.error.message : "");

  const stepTitle = isRoot
    ? "Все категории"
    : trail[trail.length - 1].labelRu;

  const handlePick = (node: CategoryNode) => {
    if (node.isLeaf) {
      const fullLabel = [...trail.map((t) => t.labelRu), node.labelRu].join(" › ");
      onSelect(node.id, fullLabel);
      setPickerOpen(false);
      setTrail([]);
      return;
    }
    setTrail((prev) => [...prev, { id: node.id, labelRu: node.labelRu }]);
  };

  const handleBack = () => {
    setTrail((prev) => prev.slice(0, -1));
  };

  const openPicker = () => {
    setPickerOpen(true);
    setTrail([]);
  };

  // ── Summary view (category already selected) ──────────────────────────────

  if (!pickerOpen && selectedCategoryId) {
    return (
      <View style={s.wrap}>
        <Text style={[s.legend, { color: theme.colors.text }]}>Категория</Text>

        {/* Summary box — mirrors .create-product-category-picker__summary */}
        <View style={[s.summary, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[s.summaryLabel, { color: theme.colors.textMuted }]}>Выбрана</Text>
          <Text style={[s.summaryValue, { color: theme.colors.text }]} numberOfLines={3}>
            {selectedCategoryLabel || "Категория выбрана"}
          </Text>
        </View>

        {/* Change link — mirrors .create-product-category-picker__mode-link */}
        <Pressable onPress={openPicker} style={({ pressed }) => [s.modeLink, pressed && { opacity: 0.6 }]}>
          <Text style={[s.modeLinkText, { color: theme.colors.action }]}>
            Изменить категорию
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Picker open ──────────────────────────────────────────────────────────

  return (
    <View style={s.wrap}>
      <Text style={[s.legend, { color: theme.colors.text }]}>Категория</Text>

      {/* Hint — mirrors .create-product-category-picker__hint */}
      <Text style={[s.hint, { color: theme.colors.textMuted }]}>
        Выберите самую точную подкатегорию
      </Text>

      {/* Trail / breadcrumb — mirrors .create-product-category-picker__trail */}
      {trail.length > 0 ? (
        <View style={s.trail}>
          {trail.map((step, i) => (
            <Text key={step.id} style={[s.trailItem, { color: theme.colors.textSecondary }]}>
              {step.labelRu}
              {i < trail.length - 1 ? (
                <Text style={{ color: theme.colors.textMuted }}> › </Text>
              ) : null}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Step title — mirrors .create-product-category-picker__step-title */}
      <Text style={[s.stepTitle, { color: theme.colors.text }]}>{stepTitle}</Text>

      {/* Error */}
      {loadError ? (
        <Text style={[s.error, { color: theme.colors.danger }]}>{loadError}</Text>
      ) : null}

      {/* Menu — mirrors .create-product-category-picker__menu */}
      <View style={[s.menu, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        {isLoading ? (
          <View style={s.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
            <Text style={[s.loadingText, { color: theme.colors.textMuted }]}>Загрузка…</Text>
          </View>
        ) : options.length === 0 ? (
          <Text style={[s.loadingText, { color: theme.colors.textMuted }]}>
            Подкатегории не найдены
          </Text>
        ) : (
          <ScrollView
            style={s.menuScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((node) => (
              <Pressable
                key={node.id}
                style={({ pressed }) => [
                  s.option,
                  pressed && { backgroundColor: theme.colors.actionSurface },
                ]}
                onPress={() => handlePick(node)}
              >
                <Text
                  style={[s.optionText, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {node.labelRu}
                </Text>
                {node.isLeaf ? (
                  /* Leaf badge — mirrors .create-product-category-picker__leaf-badge */
                  <Text style={[s.leafBadge, { color: theme.colors.textMuted }]}>
                    Выбрать
                  </Text>
                ) : (
                  /* Chevron — mirrors .create-product-category-picker__chevron */
                  <Text style={[s.chevron, { color: theme.colors.textSecondary }]}>›</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Actions — mirrors .create-product-category-picker__actions */}
      <View style={s.actions}>
        {trail.length > 0 ? (
          /* Back button — mirrors .create-product-category-picker__back */
          <Pressable
            style={({ pressed }) => [
              s.backButton,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              pressed && { opacity: 0.75 },
            ]}
            onPress={handleBack}
          >
            <Text style={[s.backButtonText, { color: theme.colors.text }]}>← Назад</Text>
          </Pressable>
        ) : null}

        {selectedCategoryId ? (
          /* Cancel / close picker link */
          <Pressable
            onPress={() => setPickerOpen(false)}
            style={({ pressed }) => [s.modeLink, pressed && { opacity: 0.6 }]}
          >
            <Text style={[s.modeLinkText, { color: theme.colors.action }]}>
              Оставить текущую
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
// Values translated from CreateProductCategoryPicker.css (1rem = 16px)

const s = StyleSheet.create({
  // Wrapper — mirrors .create-product-category-picker
  wrap: {
    gap: 8, // 0.5rem
  },

  // Legend — mirrors .create-product-category-picker__legend
  legend: {
    fontSize: 14, // 0.875rem
    fontWeight: "600",
  },

  // Hint — mirrors .create-product-category-picker__hint
  hint: {
    fontSize: 13, // 0.8125rem
    lineHeight: 18,
  },

  // Trail — mirrors .create-product-category-picker__trail
  trail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2, // 0.25rem (gap between trail items)
  },
  trailItem: {
    fontSize: 13, // 0.8125rem
  },

  // Step title — mirrors .create-product-category-picker__step-title
  stepTitle: {
    fontSize: 15, // 0.9375rem
    fontWeight: "600",
  },

  // Error — mirrors .create-product-category-picker__error
  error: {
    fontSize: 14, // 0.875rem
    lineHeight: 20,
  },

  // Menu container — mirrors .create-product-category-picker__menu
  menu: {
    borderWidth: 1,
    borderRadius: 8, // 0.5rem
    padding: 4, // 0.25rem
    maxHeight: 256, // ~16rem, matching min(16rem, 45vh)
    overflow: "hidden",
  },
  menuScroll: {
    maxHeight: 248,
  },

  // Loading row
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  loadingText: {
    fontSize: 14, // 0.875rem
    padding: 8, // 0.5rem 0.55rem
  },

  // Option — mirrors .create-product-category-picker__option
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8, // 0.5rem
    paddingVertical: 8, // 0.5rem
    paddingHorizontal: 9, // 0.55rem
    borderRadius: 6, // 0.35rem
  },
  optionText: {
    flex: 1,
    fontSize: 15, // 0.9375rem
  },

  // Chevron — mirrors .create-product-category-picker__chevron
  chevron: {
    flexShrink: 0,
    fontSize: 18,
    opacity: 0.55,
  },

  // Leaf badge — mirrors .create-product-category-picker__leaf-badge
  leafBadge: {
    flexShrink: 0,
    fontSize: 12, // 0.75rem
  },

  // Actions row — mirrors .create-product-category-picker__actions
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8, // 0.5rem
  },

  // Back button — mirrors .create-product-category-picker__back
  backButton: {
    paddingVertical: 6, // 0.35rem
    paddingHorizontal: 10, // 0.65rem
    borderWidth: 1,
    borderRadius: 8, // 0.5rem
  },
  backButtonText: {
    fontSize: 14, // 0.875rem
  },

  // Mode link — mirrors .create-product-category-picker__mode-link
  modeLink: {
    padding: 0,
  },
  modeLinkText: {
    fontSize: 13, // 0.8125rem
    textDecorationLine: "underline",
  },

  // Summary (selected state) — mirrors .create-product-category-picker__summary
  summary: {
    flexDirection: "column",
    gap: 2, // 0.15rem
    paddingVertical: 8, // 0.5rem
    paddingHorizontal: 10, // 0.625rem
    borderWidth: 1,
    borderRadius: 8, // 0.5rem
  },
  summaryLabel: {
    fontSize: 12, // 0.75rem
  },
  summaryValue: {
    fontSize: 15, // 0.9375rem
    lineHeight: 20, // 1.35
  },
});
