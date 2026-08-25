import {
  PRODUCT_PROMO_CODES_MAX_ACTIVE,
  PRODUCT_PROMO_CODE_MAX_LENGTH,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MAX,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MIN,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MAX,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MIN,
} from "@molha/api-contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fetchProductPromoCodes,
  replaceProductPromoCodes,
} from "@/entities/product-promo-code/api/productPromoCodeApi";
import { productPromoCodeQueryKeys } from "@/entities/product-promo-code/model/productPromoCodeQueryKeys";
import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type PromoRow = {
  code: string;
  discountPercent: string;
  maxActivations: string;
  enabled: boolean;
  activationsUsed: number;
};

/** То, что реально уходит на сервер: строки формы приведены к числам. */
type PromoCodePayload = {
  code: string;
  discountPercent: number;
  maxActivations: number;
  enabled: boolean;
};

const emptyRow = (): PromoRow => ({
  code: "",
  discountPercent: "10",
  maxActivations: "100",
  enabled: true,
  activationsUsed: 0,
});

type ProductPromoCodesModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (payload: { productHasActivePromoCodes: boolean }) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

/**
 * Промокоды товара глазами продавца.
 * Порт `client/src/entities/product/ui/ProductPromoCodesModal.jsx`: список
 * уходит на сервер целиком (replace), пустые коды отбрасываются.
 */
export const ProductPromoCodesModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: ProductPromoCodesModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);

  const productId = product?._id != null ? String(product._id) : "";
  const [rows, setRows] = useState<PromoRow[]>(() => [emptyRow()]);
  const [error, setError] = useState("");

  const listQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.list(productId),
    queryFn: () => fetchProductPromoCodes(productId),
    enabled: visible && Boolean(productId),
  });

  const saveMutation = useMutation({
    mutationFn: (promoCodes: PromoCodePayload[]) =>
      replaceProductPromoCodes(productId, promoCodes),
  });

  useEffect(() => {
    if (!visible || !listQuery.data) {
      return;
    }
    setError("");
    const next = (listQuery.data.promoCodes ?? []).map((row) => ({
      code: String(row.code ?? ""),
      discountPercent: String(row.discountPercent ?? ""),
      maxActivations: String(row.maxActivations ?? ""),
      enabled: row.enabled === true,
      activationsUsed: Number(row.activationsUsed ?? 0),
    }));
    setRows(next.length > 0 ? next : [emptyRow()]);
  }, [listQuery.data, visible]);

  const activeCount = rows.filter((row) => row.enabled).length;
  const patchRow = (index: number, patch: Partial<PromoRow>) => {
    setRows((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSave = async () => {
    setError("");
    const promoCodes: PromoCodePayload[] = [];

    for (const row of rows) {
      const code = String(row.code ?? "").trim();
      // Пустая строка — это незаполненная карточка, а не ошибка.
      if (!code) {
        continue;
      }
      const discountPercent = Math.floor(Number(row.discountPercent));
      const maxActivations = Math.floor(Number(row.maxActivations));

      if (
        !Number.isFinite(discountPercent) ||
        discountPercent < PRODUCT_PROMO_DISCOUNT_PERCENT_MIN ||
        discountPercent > PRODUCT_PROMO_DISCOUNT_PERCENT_MAX
      ) {
        setError(
          `Скидка должна быть от ${PRODUCT_PROMO_DISCOUNT_PERCENT_MIN} до ${PRODUCT_PROMO_DISCOUNT_PERCENT_MAX}%`,
        );
        return;
      }
      if (
        !Number.isFinite(maxActivations) ||
        maxActivations < PRODUCT_PROMO_MAX_ACTIVATIONS_MIN ||
        maxActivations > PRODUCT_PROMO_MAX_ACTIVATIONS_MAX
      ) {
        setError(
          `Активации: от ${PRODUCT_PROMO_MAX_ACTIVATIONS_MIN} до ${PRODUCT_PROMO_MAX_ACTIVATIONS_MAX}`,
        );
        return;
      }

      promoCodes.push({
        code,
        discountPercent,
        maxActivations,
        enabled: row.enabled === true,
      });
    }

    try {
      const saved = await saveMutation.mutateAsync(promoCodes);
      await queryClient.invalidateQueries({
        queryKey: productPromoCodeQueryKeys.list(productId),
      });
      onSaved?.({
        productHasActivePromoCodes:
          (saved as { productHasActivePromoCodes?: unknown })
            ?.productHasActivePromoCodes === true,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : PRODUCT_PROMO_CODE_UI.SAVE_FALLBACK,
      );
    }
  };

  if (!visible) {
    return null;
  }

  const isBusy = saveMutation.isPending;

  const sheet = (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={[styles.header, { paddingTop: headerInsetTop }]}>
          <Text style={styles.title}>{PRODUCT_PROMO_CODE_UI.MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_PROMO_CODE_UI.CLOSE}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.info}>{PRODUCT_PROMO_CODE_UI.MODAL_LEAD}</Text>

          {listQuery.isPending ? <ActivityIndicator /> : null}
          {listQuery.isError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK}
            </Text>
          ) : null}

          {rows.map((row, index) => (
            <View
              key={`promo-row-${index}`}
              style={[
                localStyles.card,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text style={styles.fieldLabel}>
                {PRODUCT_PROMO_CODE_UI.CARD_TITLE(index + 1)}
              </Text>

              <View style={styles.rowField}>
                <Text style={styles.fieldLabel}>{PRODUCT_PROMO_CODE_UI.FIELD_CODE}</Text>
                <TextInput
                  style={styles.input}
                  value={row.code}
                  maxLength={PRODUCT_PROMO_CODE_MAX_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!isBusy}
                  onChangeText={(code) => patchRow(index, { code })}
                />
              </View>

              <View style={localStyles.pairRow}>
                <View style={[styles.rowField, localStyles.pairItem]}>
                  <Text style={styles.fieldLabel}>
                    {PRODUCT_PROMO_CODE_UI.FIELD_PERCENT}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={row.discountPercent}
                    keyboardType="number-pad"
                    editable={!isBusy}
                    onChangeText={(discountPercent) => patchRow(index, { discountPercent })}
                  />
                </View>
                <View style={[styles.rowField, localStyles.pairItem]}>
                  <Text style={styles.fieldLabel}>{PRODUCT_PROMO_CODE_UI.FIELD_MAX}</Text>
                  <TextInput
                    style={styles.input}
                    value={row.maxActivations}
                    keyboardType="number-pad"
                    editable={!isBusy}
                    onChangeText={(maxActivations) => patchRow(index, { maxActivations })}
                  />
                </View>
              </View>

              <View style={localStyles.enabledRow}>
                <Switch
                  value={row.enabled === true}
                  disabled={isBusy}
                  onValueChange={(enabled) => patchRow(index, { enabled })}
                  trackColor={{
                    false: theme.colors.actionBorder,
                    true: theme.colors.action,
                  }}
                  thumbColor={theme.colors.onContrast}
                />
                <Text style={[localStyles.enabledLabel, { color: theme.colors.text }]}>
                  {PRODUCT_PROMO_CODE_UI.FIELD_ENABLED}
                  {row.activationsUsed > 0
                    ? ` · ${PRODUCT_PROMO_CODE_UI.FIELD_USED}: ${row.activationsUsed}`
                    : ""}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                style={localStyles.removeButton}
              >
                <Text style={[localStyles.removeText, { color: theme.colors.danger }]}>
                  {PRODUCT_PROMO_CODE_UI.REMOVE}
                </Text>
              </Pressable>
            </View>
          ))}

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, localStyles.footerSplit, { paddingBottom: footerInsetBottom }]}>
          <Pressable
            accessibilityRole="button"
            disabled={activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE || isBusy}
            onPress={() => {
              if (activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE) {
                setError(PRODUCT_PROMO_CODE_UI.MAX_ACTIVE);
                return;
              }
              setRows((prev) => [...prev, emptyRow()]);
            }}
            style={[
              localStyles.secondaryButton,
              { borderColor: theme.colors.action },
              (activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE || isBusy) &&
                styles.buttonDisabled,
            ]}
          >
            <Text style={[localStyles.secondaryText, { color: theme.colors.action }]}>
              {PRODUCT_PROMO_CODE_UI.ADD}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isBusy || listQuery.isPending || !productId}
            onPress={() => void handleSave()}
            style={[
              styles.saveButton,
              localStyles.saveButtonSplit,
              (isBusy || listQuery.isPending || !productId) && styles.buttonDisabled,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.saveButtonText}>{PRODUCT_PROMO_CODE_UI.SAVE}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedRoot} pointerEvents="box-none">
        {sheet}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      {sheet}
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
  },
  pairRow: {
    flexDirection: "row",
    gap: 10,
  },
  pairItem: {
    flex: 1,
  },
  enabledRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  enabledLabel: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
  },
  removeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footerSplit: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButtonSplit: {
    flex: 1,
  },
});
