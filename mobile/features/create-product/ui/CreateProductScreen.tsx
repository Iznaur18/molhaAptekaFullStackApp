import { PRODUCT_IMAGE_URLS_MAX, PRODUCT_NAME_MAX_LENGTH } from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCreateProductMutation } from "@/entities/product/model/useCreateProductMutation";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

// ─── Constants ───────────────────────────────────────────────────────────────

// These mirror client/src/entities/product/model/productConstants.js
const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
const PRODUCT_DESCRIPTION_MAX_CHARS = 2000;
const PRODUCT_STOCK_QUANTITY_MIN = 1;
const PRODUCT_STOCK_QUANTITY_MAX = 9999;
const PRODUCT_SALE_CITY_MAX_LENGTH = 80;
const PRODUCT_PRICE_RUB_MAX = 999_999_999;
const LOYALTY_POINTS_MAX_LENGTH = 8;
const CHARACTERISTICS_MAX = 10;

const WIZARD_STEPS = ["basic", "media", "category", "commerce", "review"] as const;
type WizardStepId = (typeof WIZARD_STEPS)[number];

const STEP_COPY: Record<WizardStepId, { title: string; subtitle: string; label: string }> = {
  basic: {
    title: "О товаре",
    subtitle: "Название и описание — первое, что видит покупатель",
    label: "О товаре",
  },
  media: {
    title: "Фото и видео",
    subtitle: "Добавьте до 5 фото. Первое фото станет обложкой",
    label: "Медиа",
  },
  category: {
    title: "Категория и город",
    subtitle: "Помогите покупателям найти товар в каталоге",
    label: "Категория",
  },
  commerce: {
    title: "Цена и наличие",
    subtitle: "Укажите стоимость и сколько единиц готовы продать",
    label: "Цена",
  },
  review: {
    title: "Проверка",
    subtitle: "Всё верно? Отправим товар на модерацию",
    label: "Проверка",
  },
};

// ─── Form state ──────────────────────────────────────────────────────────────

type CharacteristicRow = { id: number; key: string; value: string };

type WizardForm = {
  productName: string;
  productDescription: string;
  characteristicRows: CharacteristicRow[];
  imageUrls: string[];
  productPreviewVideoUrl: string;
  productCategoryId: string | null;
  productCategoryLabel: string;
  productCategory: string; // legacy fallback, mirrors web default
  productSaleCity: string;
  productPrice: string;
  productOldPrice: string;
  productIsAvailable: boolean;
  productStockQuantity: string;
  loyaltyPointsPerUnit: string;
};

// Default legacy category mirrors web's PRODUCT_CATEGORY_ELECTRONICS default
const DEFAULT_PRODUCT_CATEGORY = "electronics";

const INITIAL_FORM: WizardForm = {
  productName: "",
  productDescription: "",
  characteristicRows: [],
  imageUrls: [],
  productPreviewVideoUrl: "",
  productCategoryId: null,
  productCategoryLabel: "",
  productCategory: DEFAULT_PRODUCT_CATEGORY,
  productSaleCity: "",
  productPrice: "",
  productOldPrice: "",
  productIsAvailable: true,
  productStockQuantity: "1",
  loyaltyPointsPerUnit: "",
};

// ─── Validation ──────────────────────────────────────────────────────────────

function validateStep(stepId: WizardStepId, form: WizardForm): string | null {
  switch (stepId) {
    case "basic": {
      const nameError = validateProductName(form.productName);
      if (nameError) return nameError;
      const descLen = form.productDescription.trim().length;
      if (descLen < PRODUCT_DESCRIPTION_MIN_CHARS) {
        return `Описание — минимум ${PRODUCT_DESCRIPTION_MIN_CHARS} символов`;
      }
      if (descLen > PRODUCT_DESCRIPTION_MAX_CHARS) {
        return `Описание — не более ${PRODUCT_DESCRIPTION_MAX_CHARS} символов`;
      }
      return null;
    }
    case "media": {
      const hasVideo = form.productPreviewVideoUrl.trim().length > 0;
      if (hasVideo && form.imageUrls.filter(Boolean).length === 0) {
        return "При превью-видео нужно хотя бы одно фото товара";
      }
      return null;
    }
    case "category": {
      // Mirror web: require either tree categoryId OR legacy productCategory
      if (!form.productCategoryId && !form.productCategory.trim()) {
        return CREATE_PRODUCT_UI.ERROR_CATEGORY;
      }
      if (form.productSaleCity.trim().length > PRODUCT_SALE_CITY_MAX_LENGTH) {
        return `Город продажи — не длиннее ${PRODUCT_SALE_CITY_MAX_LENGTH} символов`;
      }
      return null;
    }
    case "commerce": {
      const price = parseFloat(form.productPrice.replace(/\s/g, "").replace(",", "."));
      if (!Number.isFinite(price) || price < 0) {
        return CREATE_PRODUCT_UI.ERROR_PRICE;
      }
      if (price > PRODUCT_PRICE_RUB_MAX) {
        return "Цена не может превышать 999 999 999 ₽";
      }
      const oldPriceRaw = form.productOldPrice.trim();
      if (oldPriceRaw) {
        const oldPrice = parseFloat(oldPriceRaw.replace(/\s/g, "").replace(",", "."));
        if (!Number.isFinite(oldPrice) || oldPrice <= price) {
          return "Старая цена должна быть больше текущей";
        }
        if (oldPrice > PRODUCT_PRICE_RUB_MAX) {
          return "Цена не может превышать 999 999 999 ₽";
        }
      }
      if (form.productIsAvailable) {
        const stock = Math.floor(Number(form.productStockQuantity));
        if (
          !Number.isFinite(stock) ||
          stock < PRODUCT_STOCK_QUANTITY_MIN ||
          stock > PRODUCT_STOCK_QUANTITY_MAX
        ) {
          return CREATE_PRODUCT_UI.ERROR_STOCK;
        }
      }
      return null;
    }
    case "review": {
      return (
        validateStep("basic", form) ??
        validateStep("category", form) ??
        validateStep("commerce", form)
      );
    }
    default:
      return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const keepDigits = (s: string) => s.replace(/\D/g, "");
let _charId = 0;
const nextCharId = () => ++_charId;

function computeDiscount(price: string, oldPrice: string): number | null {
  const p = parseFloat(price.replace(/\s/g, "").replace(",", "."));
  const op = parseFloat(oldPrice.replace(/\s/g, "").replace(",", "."));
  if (Number.isFinite(p) && Number.isFinite(op) && op > p && p > 0) {
    return Math.round(((op - p) / op) * 100);
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const CreateProductScreen = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useStyles();
  const createMutation = useCreateProductMutation();

  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepId = WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const copy = STEP_COPY[stepId];

  const goNext = useCallback(() => {
    const error = validateStep(stepId, form);
    if (error) { setStepError(error); return; }
    setStepError("");
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  }, [form, stepId]);

  const goBack = useCallback(() => {
    setStepError("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setStepError("");
    setStepIndex(Math.max(0, Math.min(index, WIZARD_STEPS.length - 1)));
  }, []);

  const handleSubmit = async () => {
    const error = validateStep("review", form);
    if (error) { setStepError(error); return; }
    setStepError("");
    setIsSubmitting(true);
    try {
      const price = Math.floor(Number(form.productPrice.replace(/\s/g, "").replace(",", ".")));
      const oldPriceRaw = form.productOldPrice.trim();
      const oldPrice = oldPriceRaw
        ? Math.floor(Number(oldPriceRaw.replace(/\s/g, "").replace(",", ".")))
        : null;
      const loyalty = Math.floor(Number(form.loyaltyPointsPerUnit));

      await createMutation.mutateAsync({
        productName: form.productName.trim(),
        productDescription: form.productDescription.trim(),
        productPrice: price,
        productOldPrice: oldPrice ?? undefined,
        productCategoryId: form.productCategoryId ?? undefined,
        productCategory: !form.productCategoryId ? form.productCategory || undefined : undefined,
        productIsAvailable: form.productIsAvailable,
        productStockQuantity: form.productIsAvailable
          ? Math.floor(Number(form.productStockQuantity))
          : undefined,
        productImageUrls: form.imageUrls.filter(Boolean),
        productPreviewVideoUrl: form.productPreviewVideoUrl.trim() || undefined,
        productSaleCity: form.productSaleCity.trim() || undefined,
        loyaltyPointsPerUnit: Number.isFinite(loyalty) && loyalty > 0 ? loyalty : undefined,
        productCharacteristics: form.characteristicRows
          .filter((r) => r.key.trim() && r.value.trim())
          .map((r) => ({ key: r.key.trim(), value: r.value.trim() })),
      });

      router.replace("/hub/my-products");
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Не удалось создать товар");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimaryPress = () => {
    if (isLastStep) { void handleSubmit(); } else { goNext(); }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.bg }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {CREATE_PRODUCT_UI.TITLE}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
          onPress={() => router.replace("/(tabs)")}
          hitSlop={8}
        >
          <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
        </Pressable>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={[styles.body, { backgroundColor: theme.colors.bg }]}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress card — mirrors .product-wizard-progress */}
        <WizardProgress
          steps={WIZARD_STEPS}
          stepIndex={stepIndex}
          theme={theme}
        />

        {/* Step headline — mirrors .product-wizard-step-headline */}
        <View style={styles.stepHeadline}>
          <Text style={[styles.stepTitle, { color: theme.colors.primary }]}>
            {copy.title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
            {copy.subtitle}
          </Text>
        </View>

        {/* Step content */}
        {stepId === "basic" && (
          <BasicStep form={form} setForm={setForm} disabled={isSubmitting} theme={theme} styles={styles} />
        )}
        {stepId === "media" && (
          <MediaStep form={form} setForm={setForm} disabled={isSubmitting} theme={theme} styles={styles} />
        )}
        {stepId === "category" && (
          <CategoryStep form={form} setForm={setForm} disabled={isSubmitting} theme={theme} styles={styles} />
        )}
        {stepId === "commerce" && (
          <CommerceStep form={form} setForm={setForm} disabled={isSubmitting} theme={theme} styles={styles} />
        )}
        {stepId === "review" && (
          <ReviewStep form={form} onEditStep={goToStep} theme={theme} styles={styles} />
        )}

        {/* Error message — mirrors .create-product-wizard__error */}
        {stepError ? (
          <View style={[
            styles.errorBox,
            {
              borderColor: theme.colors.danger + "59", // 35% opacity
              backgroundColor: theme.colors.surface,
            },
          ]}>
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {stepError}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Footer — mirrors .create-product-wizard__footer ── */}
      <View style={[
        styles.footer,
        {
          borderTopColor: theme.colors.border + "cc", // 80%
          backgroundColor: theme.colors.surfaceMuted,
        },
      ]}>
        {!isFirstStep ? (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: theme.colors.border + "d9", backgroundColor: theme.colors.surface },
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={goBack}
            disabled={isSubmitting}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
              Назад
            </Text>
          </Pressable>
        ) : (
          /* Placeholder to keep layout grid */
          <View style={[styles.backButton, { opacity: 0 }]} pointerEvents="none" />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.colors.action,
              borderColor: theme.colors.action,
              shadowColor: theme.colors.action,
            },
            pressed && !isSubmitting && styles.buttonPressedElevated,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handlePrimaryPress}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: theme.colors.onContrast }]}>
              {isLastStep ? "Отправить на проверку" : "Далее"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

// ─── WizardProgress ───────────────────────────────────────────────────────────
// Mirrors .product-wizard-progress from ProductWizardProgress.css

function WizardProgress({
  steps,
  stepIndex,
  theme,
}: {
  steps: readonly WizardStepId[];
  stepIndex: number;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={[
      progressStyles.card,
      {
        backgroundColor: theme.colors.actionSurface,
        borderColor: theme.colors.action + "1f", // 12% opacity
      },
    ]}>
      {/* "Шаг X из Y" caption */}
      <Text style={[progressStyles.caption, { color: theme.colors.primaryBright }]}>
        {`ШАГ ${stepIndex + 1} ИЗ ${steps.length}`}
      </Text>

      {/* Step circles row */}
      <View style={progressStyles.stepsRow}>
        {steps.map((id, i) => {
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;
          const opacity = !isActive && !isComplete ? 0.55 : 1;

          return (
            <View key={id} style={[progressStyles.stepCol, { opacity }]}>
              {/* Circle with number */}
              <View style={[
                progressStyles.circle,
                isActive && {
                  backgroundColor: theme.colors.action,
                  borderColor: theme.colors.action,
                },
                isComplete && {
                  backgroundColor: theme.colors.success + "24", // 14%
                  borderColor: theme.colors.success,
                },
                !isActive && !isComplete && {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border + "cc",
                },
              ]}>
                <Text style={[
                  progressStyles.circleText,
                  isActive && { color: theme.colors.onContrast },
                  isComplete && { color: theme.colors.success },
                  !isActive && !isComplete && { color: theme.colors.textSecondary },
                ]}>
                  {isComplete ? "✓" : String(i + 1)}
                </Text>
              </View>
              {/* Step label */}
              <Text
                style={[progressStyles.stepLabel, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {STEP_COPY[id].label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14, // 0.85rem
    paddingHorizontal: 14, // 0.85rem
    paddingTop: 10, // 0.65rem
    paddingBottom: 12, // 0.75rem
    gap: 9, // 0.55rem
  },
  caption: {
    fontSize: 11, // 0.72rem
    fontWeight: "700",
    letterSpacing: 0.9, // 0.06em at 15px base
  },
  stepsRow: {
    flexDirection: "row",
    gap: 6,
  },
  stepCol: {
    flex: 1,
    alignItems: "center",
    gap: 3, // 0.2rem
  },
  circle: {
    width: 26, // 1.65rem
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 11, // 0.72rem
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 10, // 0.62rem
    lineHeight: 12,
    textAlign: "center",
  },
});

// ─── Step types ───────────────────────────────────────────────────────────────

type StepProps = {
  form: WizardForm;
  setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
  disabled: boolean;
  theme: ReturnType<typeof useAppTheme>;
  styles: ReturnType<typeof useStyles>;
};

// ─── BasicStep ────────────────────────────────────────────────────────────────

function BasicStep({ form, setForm, disabled, theme, styles }: StepProps) {
  const descLen = form.productDescription.length;
  const overLimit = descLen > PRODUCT_DESCRIPTION_MAX_CHARS;

  const addCharRow = () => {
    if (form.characteristicRows.length >= CHARACTERISTICS_MAX) return;
    setForm((prev) => ({
      ...prev,
      characteristicRows: [
        ...prev.characteristicRows,
        { id: nextCharId(), key: "", value: "" },
      ],
    }));
  };

  const removeCharRow = (id: number) => {
    setForm((prev) => ({
      ...prev,
      characteristicRows: prev.characteristicRows.filter((r) => r.id !== id),
    }));
  };

  const updateCharRow = (id: number, field: "key" | "value", text: string) => {
    setForm((prev) => ({
      ...prev,
      characteristicRows: prev.characteristicRows.map((r) =>
        r.id === id ? { ...r, [field]: text } : r,
      ),
    }));
  };

  return (
    <View style={styles.section}>
      {/* Name field */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Название{" "}
          <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          value={form.productName}
          onChangeText={(text) => setForm((prev) => ({ ...prev, productName: text }))}
          maxLength={PRODUCT_NAME_MAX_LENGTH}
          editable={!disabled}
          placeholder="Например: iPhone 15 Pro 256 ГБ"
          placeholderTextColor={theme.colors.textMuted}
          autoCorrect={false}
        />
      </View>

      {/* Description field */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Описание{" "}
          <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          value={form.productDescription}
          onChangeText={(text) => setForm((prev) => ({ ...prev, productDescription: text }))}
          maxLength={PRODUCT_DESCRIPTION_MAX_CHARS}
          editable={!disabled}
          multiline
          placeholder="Состояние, комплектация, особенности…"
          placeholderTextColor={theme.colors.textMuted}
          textAlignVertical="top"
        />
        {/* Char meter — mirrors .create-product-section__char-meter */}
        <Text style={[styles.charMeter, { color: overLimit ? theme.colors.danger : theme.colors.textSecondary }]}>
          {`Символов: ${descLen} / ${PRODUCT_DESCRIPTION_MAX_CHARS}`}
        </Text>
      </View>

      {/* Characteristics — mirrors ProductCharacteristicsEditor */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Характеристики</Text>
        {form.characteristicRows.map((row) => (
          <View key={row.id} style={styles.charRow}>
            <TextInput
              style={[styles.charInput, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              value={row.key}
              onChangeText={(text) => updateCharRow(row.id, "key", text)}
              editable={!disabled}
              placeholder="Свойство"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={50}
            />
            <TextInput
              style={[styles.charInput, styles.charInputValue, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              value={row.value}
              onChangeText={(text) => updateCharRow(row.id, "value", text)}
              editable={!disabled}
              placeholder="Значение"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={200}
            />
            <Pressable
              style={[styles.charRemoveBtn, { borderColor: theme.colors.border }]}
              onPress={() => removeCharRow(row.id)}
              disabled={disabled}
            >
              <Text style={[styles.charRemoveText, { color: theme.colors.danger }]}>✕</Text>
            </Pressable>
          </View>
        ))}
        {form.characteristicRows.length < CHARACTERISTICS_MAX ? (
          <Pressable
            style={[styles.outlineButton, { borderColor: theme.colors.border + "d9" }]}
            onPress={addCharRow}
            disabled={disabled}
          >
            <Text style={[styles.outlineButtonText, { color: theme.colors.text }]}>
              + Добавить характеристику
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ─── MediaStep ────────────────────────────────────────────────────────────────

function MediaStep({ form, setForm, disabled, theme, styles }: StepProps) {
  const filledCount = form.imageUrls.filter(Boolean).length;

  const handleAddSlot = () => {
    if (form.imageUrls.length >= PRODUCT_IMAGE_URLS_MAX) return;
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const handleImageChange = (index: number, url: string) => {
    setForm((prev) => {
      const next = [...prev.imageUrls];
      next[index] = url;
      return { ...prev, imageUrls: next };
    });
  };

  const handleRemoveSlot = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  return (
    <View style={styles.section}>
      {/* Lead — mirrors .create-product-section__lead */}
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        Фото необязательны, но с ними товар продаётся быстрее.
      </Text>

      {form.imageUrls.length === 0 ? (
        <Pressable
          style={[styles.outlineButton, { borderColor: theme.colors.border + "d9" }]}
          onPress={handleAddSlot}
          disabled={disabled}
        >
          <Text style={[styles.outlineButtonText, { color: theme.colors.text }]}>
            Добавить фото
          </Text>
        </Pressable>
      ) : null}

      {form.imageUrls.map((url, index) => (
        <View key={index} style={styles.imageSlot}>
          <ImageUrlUploadField
            label={index === 0 ? "Фото 1 (обложка)" : `Фото ${index + 1}`}
            value={url}
            onChange={(next) => handleImageChange(index, next)}
            disabled={disabled}
          />
          <Pressable
            style={[styles.removeImageButton, { borderColor: theme.colors.border + "d9" }]}
            onPress={() => handleRemoveSlot(index)}
            disabled={disabled}
          >
            <Text style={[styles.removeImageText, { color: theme.colors.danger }]}>
              Удалить фото
            </Text>
          </Pressable>
        </View>
      ))}

      {form.imageUrls.length > 0 && form.imageUrls.length < PRODUCT_IMAGE_URLS_MAX ? (
        <Pressable
          style={[styles.outlineButton, { borderColor: theme.colors.border + "d9" }]}
          onPress={handleAddSlot}
          disabled={disabled}
        >
          <Text style={[styles.outlineButtonText, { color: theme.colors.text }]}>
            + Добавить ещё фото ({filledCount} / {PRODUCT_IMAGE_URLS_MAX})
          </Text>
        </Pressable>
      ) : form.imageUrls.length >= PRODUCT_IMAGE_URLS_MAX ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          Максимум {PRODUCT_IMAGE_URLS_MAX} фото
        </Text>
      ) : null}

      {/* Video preview field */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Видео-превью{" "}
          <Text style={[styles.optionalTag, { color: theme.colors.textMuted }]}>
            (необязательно)
          </Text>
        </Text>
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          URL загруженного короткого видео (до 3 сек). При указании видео нужно хотя бы одно фото.
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          value={form.productPreviewVideoUrl}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, productPreviewVideoUrl: text }))
          }
          editable={!disabled}
          placeholder="https://… или /uploads/…"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

// ─── CategoryStep ─────────────────────────────────────────────────────────────

function CategoryStep({ form, setForm, disabled, theme, styles }: StepProps) {
  return (
    <View style={styles.section}>
      {/* Lead */}
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        Выберите самую точную подкатегорию.
      </Text>

      <CreateProductCategoryPicker
        selectedCategoryId={form.productCategoryId}
        selectedCategoryLabel={form.productCategoryLabel}
        onSelect={(id, label) =>
          setForm((prev) => ({
            ...prev,
            productCategoryId: id,
            productCategoryLabel: label,
            productCategory: "", // clear legacy when tree category is selected
          }))
        }
      />

      {/* Sale city */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Город продажи</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          value={form.productSaleCity}
          onChangeText={(text) => setForm((prev) => ({ ...prev, productSaleCity: text }))}
          editable={!disabled}
          placeholder="Москва"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={PRODUCT_SALE_CITY_MAX_LENGTH}
        />
        {/* Hint — mirrors .create-product-section__hint */}
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Пусто — товар виден во всех городах
        </Text>
      </View>
    </View>
  );
}

// ─── CommerceStep ─────────────────────────────────────────────────────────────

function CommerceStep({ form, setForm, disabled, theme, styles }: StepProps) {
  const discountPercent = computeDiscount(form.productPrice, form.productOldPrice);

  return (
    <View style={styles.section}>
      {/* Lead */}
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        Старая цена покажет скидку, если она выше текущей.
      </Text>

      {/* Price grid — mirrors .create-product-section__price-grid */}
      <View style={styles.priceGrid}>
        <View style={[styles.fieldLabel, styles.priceCol]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Цена, ₽{" "}
            <Text style={{ color: theme.colors.danger }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.priceInput, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            value={form.productPrice}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, productPrice: keepDigits(text) }))
            }
            editable={!disabled}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
        <View style={[styles.fieldLabel, styles.priceCol]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Старая цена, ₽</Text>
          <TextInput
            style={[styles.input, styles.priceInput, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            value={form.productOldPrice}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, productOldPrice: keepDigits(text) }))
            }
            editable={!disabled}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
      </View>

      {/* Discount preview — mirrors .create-product-section__discount-preview */}
      {discountPercent != null ? (
        <View style={[styles.discountPreview, { backgroundColor: theme.colors.success + "1f" }]}>
          <Text style={[styles.discountPreviewText, { color: theme.colors.success }]}>
            {`Скидка: −${discountPercent}%`}
          </Text>
        </View>
      ) : null}

      {/* Availability toggle — mirrors .create-product-section__check */}
      <View style={styles.checkRow}>
        <Switch
          value={form.productIsAvailable}
          onValueChange={(checked) =>
            setForm((prev) => ({
              ...prev,
              productIsAvailable: checked,
              productStockQuantity:
                checked && !prev.productStockQuantity.trim() ? "1" : prev.productStockQuantity,
            }))
          }
          disabled={disabled}
          trackColor={{ true: theme.colors.action, false: theme.colors.border }}
          thumbColor={theme.colors.onContrast}
        />
        <Text style={[styles.checkLabel, { color: theme.colors.text }]}>
          Товар в наличии
        </Text>
      </View>

      {/* Stock quantity */}
      {form.productIsAvailable ? (
        <View style={styles.fieldLabel}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Количество, шт.{" "}
            <Text style={{ color: theme.colors.danger }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            value={form.productStockQuantity}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, productStockQuantity: keepDigits(text) }))
            }
            editable={!disabled}
            keyboardType="number-pad"
            maxLength={String(PRODUCT_STOCK_QUANTITY_MAX).length}
          />
        </View>
      ) : null}

      {/* Loyalty points */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Бонусные баллы за шт.
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          value={form.loyaltyPointsPerUnit}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, loyaltyPointsPerUnit: keepDigits(text) }))
          }
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={LOYALTY_POINTS_MAX_LENGTH}
          placeholder="0"
          placeholderTextColor={theme.colors.textMuted}
        />
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          Начисляются премиум-покупателю после подтверждения получения
        </Text>
      </View>
    </View>
  );
}

// ─── ReviewStep ───────────────────────────────────────────────────────────────

function ReviewStep({
  form,
  onEditStep,
  theme,
  styles,
}: {
  form: WizardForm;
  onEditStep: (index: number) => void;
  theme: ReturnType<typeof useAppTheme>;
  styles: ReturnType<typeof useStyles>;
}) {
  const imageCount = form.imageUrls.filter(Boolean).length;
  const discountPercent = computeDiscount(form.productPrice, form.productOldPrice);

  const rows: Array<{ label: string; value: string; stepIndex: number; multiline?: boolean }> = [
    { label: "Название", value: form.productName.trim() || "—", stepIndex: 0 },
    { label: "Описание", value: form.productDescription.trim() || "—", stepIndex: 0, multiline: true },
    {
      label: "Фото и видео",
      value:
        imageCount > 0
          ? `${imageCount} фото${form.productPreviewVideoUrl.trim() ? " + видео" : ""}`
          : form.productPreviewVideoUrl.trim() ? "Только видео" : "Нет фото",
      stepIndex: 1,
    },
    { label: "Категория", value: form.productCategoryLabel || "—", stepIndex: 2 },
    { label: "Город продажи", value: form.productSaleCity.trim() || "Все города", stepIndex: 2 },
    {
      label: "Цена, ₽",
      value: `${form.productPrice.trim() || "0"} ₽${discountPercent != null ? ` (−${discountPercent}%)` : ""}`,
      stepIndex: 3,
    },
    {
      label: "Количество",
      value: form.productIsAvailable
        ? `${form.productStockQuantity.trim()} шт.`
        : "Скрыт из каталога",
      stepIndex: 3,
    },
  ];

  return (
    <View style={styles.section}>
      {/* Lead */}
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        Проверьте данные перед публикацией. Любой блок можно изменить.
      </Text>

      {/* Review rows — mirrors .create-product-review__list */}
      {rows.map((row) => (
        <View
          key={row.label}
          style={[
            styles.reviewRow,
            {
              borderColor: theme.colors.border + "cc", // 80%
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <View style={styles.reviewContent}>
            {/* Term — mirrors .create-product-review__term */}
            <Text style={[styles.reviewTerm, { color: theme.colors.textSecondary }]}>
              {row.label}
            </Text>
            {/* Value — mirrors .create-product-review__value */}
            <Text
              style={[styles.reviewValue, { color: theme.colors.text }]}
              numberOfLines={row.multiline ? 3 : undefined}
            >
              {row.value}
            </Text>
          </View>
          {/* Edit — mirrors .create-product-review__edit */}
          <Pressable
            style={({ pressed }) => [
              styles.reviewEditBtn,
              pressed && { backgroundColor: theme.colors.action + "1a" },
            ]}
            onPress={() => onEditStep(row.stepIndex)}
          >
            <Text style={[styles.reviewEditText, { color: theme.colors.action }]}>
              Изменить
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// All values translated from the web CSS (1rem = 16px base)

const useStyles = createThemedStyles((theme) => ({
  // ── Layout ──

  root: {
    flex: 1,
  },

  // Header — mirrors .product-modal-shell__header
  header: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Body — mirrors .create-product-wizard__body
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20, // 1.25rem
    paddingBottom: 32,
    gap: 16, // 1rem
  },

  // Step headline — mirrors .product-wizard-step-headline
  stepHeadline: {
    gap: 4, // 0.25rem
  },
  stepTitle: {
    fontSize: 18, // 1.15rem
    fontWeight: "800",
    letterSpacing: -0.35, // -0.02em
    marginBottom: 0,
  },
  stepSubtitle: {
    fontSize: 14, // 0.88rem
    lineHeight: 20, // 1.45 * 14
  },

  // Section — mirrors .create-product-section
  section: {
    gap: 16, // 1rem
  },

  // ── Field layout — mirrors .create-product-section__label ──
  fieldLabel: {
    gap: 6, // 0.4rem
  },

  // Field label text (inherits from web, no explicit size in CSS — using 14px)
  label: {
    fontSize: 14,
    fontWeight: "600",
  },

  optionalTag: {
    fontWeight: "400",
    fontSize: 13,
  },

  // Input — mirrors .create-product-section__input
  input: {
    borderWidth: 1,
    borderRadius: 10, // 0.65rem
    paddingHorizontal: 12, // 0.75rem
    paddingVertical: 10, // 0.65rem
    fontSize: 15, // 0.95rem
  },

  // Textarea — mirrors .create-product-section__textarea
  textarea: {
    minHeight: 128, // 8rem
    textAlignVertical: "top",
    lineHeight: 22, // 1.45
  },

  // Char meter — mirrors .create-product-section__char-meter
  charMeter: {
    fontSize: 12, // 0.78rem
  },

  // Lead — mirrors .create-product-section__lead
  lead: {
    fontSize: 15, // 0.92rem
    lineHeight: 22, // 1.5
  },

  // Hint — mirrors .create-product-section__hint
  hint: {
    fontSize: 13, // 0.82rem
    lineHeight: 18, // 1.4
  },

  // ── Characteristics ──

  charRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  charInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  charInputValue: {
    flex: 1.5,
  },
  charRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 7, // 0.45rem
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  charRemoveText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Outline add button (dashed-style secondary action) ──

  outlineButton: {
    borderWidth: 1,
    borderRadius: 10, // 0.65rem
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Media slot ──

  imageSlot: {
    gap: 6,
  },
  removeImageButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Price grid — mirrors .create-product-section__price-grid ──

  priceGrid: {
    flexDirection: "row",
    gap: 12, // 0.75rem
  },
  priceCol: {
    flex: 1,
  },
  priceInput: {
    fontVariant: ["tabular-nums"],
  },

  // Discount preview — mirrors .create-product-section__discount-preview
  discountPreview: {
    borderRadius: 9, // 0.55rem
    paddingVertical: 7, // 0.45rem
    paddingHorizontal: 10, // 0.65rem
  },
  discountPreviewText: {
    fontSize: 14, // 0.88rem
    fontWeight: "600",
  },

  // Availability check row — mirrors .create-product-section__check
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9, // 0.55rem
    paddingVertical: 2,
  },
  checkLabel: {
    fontSize: 15, // 0.92rem
    fontWeight: "500",
  },

  // ── Review rows — mirrors .create-product-review ──

  // Row — mirrors .create-product-review__row
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10, // 0.65rem
    paddingVertical: 10, // 0.65rem
    paddingHorizontal: 12, // 0.75rem
    gap: 12, // 0.75rem
  },
  reviewContent: {
    flex: 1,
    gap: 4, // between term and value
  },

  // Term — mirrors .create-product-review__term
  reviewTerm: {
    fontSize: 11, // 0.72rem
    fontWeight: "700",
    letterSpacing: 0.6, // 0.04em
    textTransform: "uppercase",
  },

  // Value — mirrors .create-product-review__value
  reviewValue: {
    fontSize: 15, // 0.95rem
    lineHeight: 20, // 1.35
  },

  // Edit button — mirrors .create-product-review__edit
  reviewEditBtn: {
    paddingVertical: 6, // 0.35rem
    paddingHorizontal: 9, // 0.55rem
    borderRadius: 7, // 0.45rem
  },
  reviewEditText: {
    fontSize: 13, // 0.82rem
    fontWeight: "600",
  },

  // ── Error — mirrors .create-product-wizard__error ──

  errorBox: {
    borderWidth: 1,
    borderRadius: 9, // 0.55rem
    paddingVertical: 9, // 0.55rem
    paddingHorizontal: 11, // 0.7rem
  },
  errorText: {
    fontSize: 14, // 0.88rem
    lineHeight: 20,
  },

  // ── Footer — mirrors .create-product-wizard__footer ──

  footer: {
    flexShrink: 0,
    flexDirection: "row",
    gap: 10, // 0.65rem
    paddingHorizontal: 20, // 1.25rem
    paddingTop: 12, // ~var(--iz-space-3)
    paddingBottom: 20, // safe-area fallback
    borderTopWidth: 1,
  },

  // Back button — mirrors .create-product-wizard__back
  backButton: {
    flex: 1,
    minHeight: 44, // 2.75rem
    borderWidth: 1,
    borderRadius: 11, // 0.7rem
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 15, // 0.92rem
    fontWeight: "700",
  },

  // Primary button — mirrors .create-product-wizard__primary
  primaryButton: {
    flex: 1.4,
    minHeight: 44, // 2.75rem
    borderWidth: 1,
    borderRadius: 11, // 0.7rem
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    // Shadow — mirrors box-shadow: 0 8px 20px action 24%
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15, // 0.92rem
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.85,
  },
  buttonPressedElevated: {
    // translateY(-1px) equivalent — subtle lift
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));
