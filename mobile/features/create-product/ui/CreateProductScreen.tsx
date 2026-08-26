import {
  getRuRegionByCode,
  isRuRegionCode,
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_IMAGE_URLS_MAX,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  syncLegacyPickupFieldsFromLocations,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PRICE_RUB_MAX,
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCreateProductMutation } from "@/entities/product/model/useCreateProductMutation";
import { createProductPickupFieldsFromUser } from "@/entities/product/lib/createProductPickupFieldsFromUser";
import { createProductWizardFormFromCopiedProduct } from "@/entities/product/lib/createProductWizardFormFromCopiedProduct";
import { createProductWizardFormFromProduct } from "@/entities/product/lib/createProductWizardFormFromProduct";
import { serializeProductCharacteristicRows } from "@/entities/product/lib/productCharacteristicRows";
import { useCatalogProductQuery } from "@/entities/product/model/useCatalogProductQuery";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { validateProductName } from "@/entities/product/lib/validateProductName";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { userSavedAddressesFromUser } from "@/entities/address/lib/userSavedAddressesFromUser";
import type { SavedAddressPickerItem } from "@/entities/address/ui/SavedAddressPicker";
import type { ProductPickupLocationValue as ProductPickupPoint } from "@/entities/product/lib/productPickupLocationsFromSavedAddresses";
import {
  isPickupAddressAmongLocations,
  pickupLocationsSummary,
  validateProductPickupLocationsList,
} from "@/entities/product/lib/productPickupLocationsFromSavedAddresses";
import {
  createProductReturnTermRow,
  PRODUCT_RETURN_TERM_KEY_MAX,
  PRODUCT_RETURN_TERM_VALUE_MAX,
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
  serializeProductReturnTermRows,
  validateProductReturnTermRows,
  type ProductReturnTermRow,
} from "@/entities/product/lib/productReturnTermRows";
import {
  isProductListingOrigin,
  PRODUCT_LISTING_ORIGIN_OPTIONS,
  type ProductListingOrigin,
} from "@/entities/product/lib/productListingOrigin";
import { ProductListingOriginChips } from "@/entities/product/ui/ProductListingOriginChips";
import { ProductPickupLocationFields } from "@/entities/product/ui/ProductPickupLocationFields";
import { ProductDescriptionField } from "@/entities/product/ui/ProductDescriptionField";
import { ProductPhotoGrid } from "@/features/image-upload/ui/ProductPhotoGrid";
import { ProductPreviewVideoUploadField } from "@/features/image-upload/ui/ProductPreviewVideoUploadField";
import { CreateProductCategoryPicker } from "@/features/create-product/ui/CreateProductCategoryPicker";
import {
  getCreateProductLaunchSeq,
  peekCreateProductLaunch,
} from "@/features/create-product/model/productCopyDraftStore";
import { API_CLIENT_UI, CREATE_PRODUCT_UI, PRODUCT_PICKUP_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { formatRubPriceInput, parseRubPriceInput } from "@/shared/lib/rubPriceInput";
import { ProductModalShell } from "@/shared/ui/ProductModalShell";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { resolveWizardFooterPaddingBottom } from "@/shared/theme/screenContentLayout";

// ─── Constants ───────────────────────────────────────────────────────────────


const WIZARD_STEPS = [
  "category",
  "basic",
  "originality",
  "media",
  "pickup",
  "commerce",
  "returns",
  "review",
] as const;
type WizardStepId = (typeof WIZARD_STEPS)[number];

const STEP_COPY: Record<
  WizardStepId,
  { title: string; subtitle: string; label: string }
> = {
  basic: {
    title: "О товаре",
    subtitle: "Название и описание — первое, что видит покупатель",
    label: "О товаре",
  },
  originality: {
    title: "Статус товара",
    subtitle: "",
    label: "Статус",
  },
  media: {
    title: "Фото и видео",
    subtitle: "До 5 фото, можно выбрать несколько сразу. Первое — обложка",
    label: "Медиа",
  },
  category: {
    title: "Категория и регион",
    subtitle: "Помогите покупателям найти товар в каталоге",
    label: "Категория",
  },
  pickup: {
    title: "Самовывоз",
    subtitle: "Укажите адрес, где покупатель заберёт товар",
    label: "Самовывоз",
  },
  commerce: {
    title: "Цена и наличие",
    subtitle: "Укажите стоимость и сколько единиц готовы продать",
    label: "Цена",
  },
  returns: {
    title: "Возврат",
    subtitle: "",
    label: "Возврат",
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
  productListingOrigin: ProductListingOrigin | null;
  productIsOriginal: boolean;
  productDescription: string;
  characteristicRows: CharacteristicRow[];
  imageUrls: string[];
  productPreviewVideoUrl: string;
  productCategoryId: string | null;
  productCategoryLabel: string;
  productCategory: string; // legacy fallback, mirrors web default
  productRegionCode: string;
  productPickupAddress: string;
  productPickupLat: number | null;
  productPickupLon: number | null;
  productPickupSelectedFromSuggest: boolean;
  productPickupLocations: ProductPickupPoint[];
  productPickupEnabled: boolean;
  productDeliveryEnabled: boolean;
  productPrice: string;
  productOldPrice: string;
  productIsAvailable: boolean;
  productStockQuantity: string;
  loyaltyPointsPerUnit: string;
  productReturnEnabled: boolean | null;
  returnTermRows: ProductReturnTermRow[];
};

// Default legacy category mirrors web's PRODUCT_CATEGORY_ELECTRONICS default
const DEFAULT_PRODUCT_CATEGORY = "electronics";

const INITIAL_FORM: WizardForm = {
  productName: "",
  productListingOrigin: null,
  productIsOriginal: false,
  productDescription: "",
  characteristicRows: [],
  imageUrls: [],
  productPreviewVideoUrl: "",
  productCategoryId: null,
  productCategoryLabel: "",
  productCategory: DEFAULT_PRODUCT_CATEGORY,
  productRegionCode: "",
  productPickupAddress: "",
  productPickupLat: null,
  productPickupLocations: [],
  productPickupLon: null,
  productPickupSelectedFromSuggest: false,
  productPickupEnabled: true,
  productDeliveryEnabled: false,
  productPrice: "",
  productOldPrice: "",
  productIsAvailable: true,
  productStockQuantity: "1",
  loyaltyPointsPerUnit: "0",
  productReturnEnabled: null,
  returnTermRows: [],
};

// ─── Validation ──────────────────────────────────────────────────────────────

type ValidateStepOptions = {
  showCatalogAvailabilityToggle?: boolean;
};

function validateStep(
  stepId: WizardStepId,
  form: WizardForm,
  options: ValidateStepOptions = {},
): string | null {
  const showCatalogAvailabilityToggle = options.showCatalogAvailabilityToggle !== false;
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
    case "originality": {
      if (!isProductListingOrigin(form.productListingOrigin)) {
        return CREATE_PRODUCT_UI.ERROR_LISTING_ORIGIN;
      }
      return null;
    }
    case "media": {
      const imageCount = form.imageUrls.filter(Boolean).length;
      if (imageCount === 0) {
        return CREATE_PRODUCT_UI.ERROR_IMAGE_REQUIRED;
      }
      return null;
    }
    case "category": {
      return null;
    }
    case "pickup": {
      const address = form.productPickupAddress.trim();
      const points = form.productPickupLocations;

      if (points.length === 0) {
        // Легаси-путь: точек нет, сервер завернёт одно поле адреса в
        // единственную точку — значит адрес и координаты обязательны.
        if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
          return PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE;
        }
        const hasLat =
          form.productPickupLat != null && Number.isFinite(form.productPickupLat);
        const hasLon =
          form.productPickupLon != null && Number.isFinite(form.productPickupLon);
        if (!hasLat || !hasLon) {
          return CREATE_PRODUCT_UI.ERROR_PICKUP_COORDS;
        }
      } else {
        // Непустой список на сервере перебивает легаси-поля, и проверять его
        // надо по тем же правилам контракта, что и в вебе.
        const locationsError = validateProductPickupLocationsList(points);
        if (locationsError) {
          return locationsError;
        }
        // Адрес, оставшийся в поле и не ставший точкой, при сохранении
        // потеряется — молча терять то, что продавец набрал, нельзя.
        if (address.length > 0 && !isPickupAddressAmongLocations(address, points)) {
          return PRODUCT_PICKUP_UI.ERROR_ADDRESS_NOT_ADDED;
        }
      }

      if (form.productPickupEnabled === false && form.productDeliveryEnabled !== true) {
        return PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE;
      }
      return null;
    }
    case "commerce": {
      const price = parseRubPriceInput(form.productPrice);
      if (price == null || price < 0) {
        return CREATE_PRODUCT_UI.ERROR_PRICE;
      }
      if (price > PRODUCT_PRICE_RUB_MAX) {
        return "Цена не может превышать 999 999 999 ₽";
      }
      const oldPriceRaw = form.productOldPrice.trim();
      if (oldPriceRaw) {
        const oldPrice = parseRubPriceInput(form.productOldPrice);
        if (oldPrice == null || oldPrice <= price) {
          return "Старая цена должна быть больше текущей";
        }
        if (oldPrice > PRODUCT_PRICE_RUB_MAX) {
          return "Цена не может превышать 999 999 999 ₽";
        }
      }
      const stockRequired = showCatalogAvailabilityToggle ? form.productIsAvailable : true;
      if (stockRequired) {
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
    case "returns": {
      if (form.productReturnEnabled == null) {
        return "Выберите: есть ли возврат";
      }
      if (form.productReturnEnabled) {
        return validateProductReturnTermRows(form.returnTermRows);
      }
      return null;
    }
    case "review": {
      const reviewOptions = { showCatalogAvailabilityToggle };
      return (
        validateStep("basic", form, reviewOptions) ??
        validateStep("originality", form, reviewOptions) ??
        validateStep("media", form, reviewOptions) ??
        validateStep("category", form, reviewOptions) ??
        validateStep("pickup", form, reviewOptions) ??
        validateStep("commerce", form, reviewOptions) ??
        validateStep("returns", form, reviewOptions)
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
  const p = parseRubPriceInput(price);
  const op = parseRubPriceInput(oldPrice);
  if (p != null && op != null && op > p && p > 0) {
    return Math.round(((op - p) / op) * 100);
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export type ProductWizardMode = "create" | "edit";

export type ProductWizardScreenProps = {
  mode?: ProductWizardMode;
  productId?: string;
};

export const ProductWizardScreen = ({
  mode = "create",
  productId = "",
}: ProductWizardScreenProps) => {
  const isEdit = mode === "edit";
  const showCatalogAvailabilityToggle = !isEdit;
  const validateOptions = useMemo(
    () => ({ showCatalogAvailabilityToggle }),
    [showCatalogAvailabilityToggle],
  );
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const createMutation = useCreateProductMutation();
  const { patchMutation } = useMyProductMutations();
  const productQuery = useCatalogProductQuery(productId);
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user ?? null;
  /** Книга адресов профиля — источник точек самовывоза в шаге «самовывоз». */
  const savedAddresses = useMemo(
    () => (user != null ? userSavedAddressesFromUser(user) : []),
    [user],
  );
  const initialLaunch = peekCreateProductLaunch();
  const [form, setForm] = useState<WizardForm>(() =>
    initialLaunch?.kind === "copy"
      ? createProductWizardFormFromCopiedProduct(initialLaunch.product)
      : {
          ...INITIAL_FORM,
          ...createProductPickupFieldsFromUser(user),
        },
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profilePickupSeededRef = useRef(
    Boolean(user) || initialLaunch?.kind === "copy",
  );
  const appliedLaunchSeqRef = useRef(
    initialLaunch ? getCreateProductLaunchSeq() : 0,
  );
  const editPrefilledRef = useRef(false);

  const applyCreateProductLaunch = useCallback(() => {
    if (isEdit) {
      return;
    }
    const launch = peekCreateProductLaunch();
    const seq = getCreateProductLaunchSeq();
    if (!launch || appliedLaunchSeqRef.current === seq) {
      return;
    }
    appliedLaunchSeqRef.current = seq;
    if (launch.kind === "copy") {
      setForm(createProductWizardFormFromCopiedProduct(launch.product));
      profilePickupSeededRef.current = true;
    } else {
      setForm({
        ...INITIAL_FORM,
        ...createProductPickupFieldsFromUser(user),
      });
      profilePickupSeededRef.current = Boolean(user);
    }
    setStepIndex(0);
    setStepError("");
  }, [isEdit, user]);

  useFocusEffect(
    useCallback(() => {
      applyCreateProductLaunch();
    }, [applyCreateProductLaunch]),
  );

  useEffect(() => {
    if (isEdit || profilePickupSeededRef.current || !user) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      ...createProductPickupFieldsFromUser(user),
    }));
    profilePickupSeededRef.current = true;
  }, [isEdit, user]);

  useEffect(() => {
    if (!isEdit || !productQuery.data || editPrefilledRef.current) {
      return;
    }
    setForm(createProductWizardFormFromProduct(productQuery.data as Record<string, unknown>));
    editPrefilledRef.current = true;
    setStepIndex(0);
    setStepError("");
  }, [isEdit, productQuery.data]);

  const stepId = WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const copy = STEP_COPY[stepId];
  const showStepHeadline =
    !isEdit ||
    !["basic", "originality", "pickup", "commerce", "returns"].includes(stepId);

  const goNext = useCallback(() => {
    const error = validateStep(stepId, form, validateOptions);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");
    setStepIndex(Math.min(stepIndex + 1, WIZARD_STEPS.length - 1));
  }, [form, stepId, stepIndex, validateOptions]);

  const goBack = useCallback(() => {
    setStepError("");
    setStepIndex(Math.max(stepIndex - 1, 0));
  }, [stepIndex]);

  const handleCancel = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, [router]);

  const goToStep = useCallback((index: number) => {
    setStepError("");
    setStepIndex(Math.max(0, Math.min(index, WIZARD_STEPS.length - 1)));
  }, []);

  const handleSubmit = async () => {
    const error = validateStep("review", form, validateOptions);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");
    setIsSubmitting(true);
    try {
      const price = parseRubPriceInput(form.productPrice) ?? 0;
      const oldPriceRaw = form.productOldPrice.trim();
      const oldPrice = oldPriceRaw ? parseRubPriceInput(form.productOldPrice) : null;

      // Непустой список точек на сервере перебивает легаси-поля: он собирает
      // их из основной точки. Шлём то же самое, иначе товар сохранится с
      // адресом, которого продавец в списке не видел.
      const legacyPickup =
        form.productPickupLocations.length > 0
          ? syncLegacyPickupFieldsFromLocations(form.productPickupLocations)
          : {
              productPickupAddress: form.productPickupAddress.trim(),
              productPickupLat: form.productPickupLat,
              productPickupLon: form.productPickupLon,
            };

      if (isEdit) {
        await patchMutation.mutateAsync({
          productId,
          body: {
            productName: form.productName.trim(),
            productListingOrigin: form.productListingOrigin!,
            productDescription: form.productDescription.trim(),
            productPrice: price,
            productOldPrice: oldPriceRaw ? oldPrice : null,
            productCategoryId: form.productCategoryId ?? undefined,
            ...(isRuRegionCode(form.productRegionCode.trim())
              ? { productRegionCode: form.productRegionCode.trim() }
              : {}),
            // Пустой список не шлём: сервер тогда уходит на legacy-слияние
            // (`mergeLegacyPickupIntoExistingLocations`) и сохраняет точки,
            // заданные на сайте, вместо того чтобы схлопнуть их в одну.
            ...(form.productPickupLocations.length > 0
              ? { productPickupLocations: form.productPickupLocations }
              : {}),
            productPickupAddress: legacyPickup.productPickupAddress,
            productPickupLat: legacyPickup.productPickupLat,
            productPickupLon: legacyPickup.productPickupLon,
            productPickupEnabled: form.productPickupEnabled !== false,
            productDeliveryEnabled: form.productDeliveryEnabled === true,
            productStockQuantity: Math.floor(Number(form.productStockQuantity)),
            productImageUrls: form.imageUrls.filter(Boolean),
            productPreviewVideoUrl: form.productPreviewVideoUrl.trim() || undefined,
            productCharacteristics: serializeProductCharacteristicRows(form.characteristicRows),
            productReturnEnabled: form.productReturnEnabled === true,
            productReturnTerms:
              form.productReturnEnabled === true
                ? serializeProductReturnTermRows(form.returnTermRows)
                : [],
          },
        });
        handleCancel();
        return;
      }

      await createMutation.mutateAsync({
        productName: form.productName.trim(),
        productListingOrigin: form.productListingOrigin!,
        productIsOriginal: false,
        productDescription: form.productDescription.trim(),
        productPrice: price,
        productOldPrice: oldPrice ?? undefined,
        productCategoryId: form.productCategoryId ?? undefined,
        productCategory: !form.productCategoryId
          ? form.productCategory || undefined
          : undefined,
        productIsAvailable: form.productIsAvailable,
        productStockQuantity: form.productIsAvailable
          ? Math.floor(Number(form.productStockQuantity))
          : undefined,
        productImageUrls: form.imageUrls.filter(Boolean),
        productPreviewVideoUrl: form.productPreviewVideoUrl.trim() || undefined,
        ...(isRuRegionCode(form.productRegionCode.trim())
          ? { productRegionCode: form.productRegionCode.trim() }
          : {}),
        // Пустой список не шлём: контракт примет его как «точек нет» и сотрёт
        // то, что продавец задал на сайте.
        ...(form.productPickupLocations.length > 0
          ? { productPickupLocations: form.productPickupLocations }
          : {}),
        productPickupAddress: legacyPickup.productPickupAddress,
        productPickupLat: legacyPickup.productPickupLat,
        productPickupLon: legacyPickup.productPickupLon,
        productPickupEnabled: form.productPickupEnabled !== false,
        productDeliveryEnabled: form.productDeliveryEnabled === true,
        productCharacteristics: form.characteristicRows
          .filter((r) => r.key.trim() && r.value.trim())
          .map((r) => ({ key: r.key.trim(), value: r.value.trim() })),
        productReturnEnabled: form.productReturnEnabled === true,
        productReturnTerms:
          form.productReturnEnabled === true
            ? serializeProductReturnTermRows(form.returnTermRows)
            : [],
      });

      router.replace("/hub/my-products");
    } catch (err) {
      setStepError(
        err instanceof Error
          ? err.message
          : isEdit
            ? CREATE_PRODUCT_UI.SAVE
            : "Не удалось создать товар",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimaryPress = () => {
    if (isLastStep) {
      void handleSubmit();
    } else {
      goNext();
    }
  };

  const primaryLabel = isSubmitting
    ? isEdit
      ? CREATE_PRODUCT_UI.SAVE_LOADING
      : CREATE_PRODUCT_UI.SUBMIT_LOADING
    : isLastStep
      ? isEdit
        ? CREATE_PRODUCT_UI.SAVE
        : "Отправить на проверку"
      : "Далее";

  const renderStepContent = () => (
    <>
      {stepId === "basic" ? (
        <BasicStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
        />
      ) : null}
      {stepId === "originality" ? (
        <OriginalityStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
        />
      ) : null}
      {stepId === "media" ? (
        <MediaStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
        />
      ) : null}
      {stepId === "category" ? (
        <CategoryStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
        />
      ) : null}
      {stepId === "pickup" ? (
        <PickupStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          savedAddresses={savedAddresses}
        />
      ) : null}
      {stepId === "commerce" ? (
        <CommerceStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
          showCatalogAvailabilityToggle={showCatalogAvailabilityToggle}
          isEdit={isEdit}
        />
      ) : null}
      {stepId === "returns" ? (
        <ReturnsStep
          form={form}
          setForm={setForm}
          disabled={isSubmitting}
          theme={theme}
          styles={styles}
        />
      ) : null}
      {stepId === "review" ? (
        <ReviewStep
          form={form}
          onEditStep={goToStep}
          theme={theme}
          styles={styles}
          isEdit={isEdit}
        />
      ) : null}
    </>
  );

  const renderWizardBody = () => (
    <>
      <WizardProgress steps={WIZARD_STEPS} stepIndex={stepIndex} theme={theme} />
      {showStepHeadline ? (
        <View style={styles.stepHeadline}>
          <Text style={[styles.stepTitle, { color: theme.colors.primary }]}>
            {copy.title}
          </Text>
          {copy.subtitle ? (
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {copy.subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {renderStepContent()}
      {stepError ? (
        <View
          style={[
            styles.errorBox,
            {
              borderColor: theme.colors.danger + "59",
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            {stepError}
          </Text>
        </View>
      ) : null}
    </>
  );

  const renderFooter = (inModal: boolean) => (
    <View
      style={[
        inModal ? styles.footerInModal : styles.footer,
        !inModal && {
          borderTopColor: theme.colors.border + "cc",
          backgroundColor: theme.colors.surfaceMuted,
          paddingBottom: resolveWizardFooterPaddingBottom(insets.bottom, screenWidth),
        },
      ]}
    >
      {!isFirstStep ? (
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              borderColor: theme.colors.border + "d9",
              backgroundColor: theme.colors.surface,
            },
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
      ) : isEdit ? (
        <View
          style={[
            styles.backButton,
            styles.backButtonPlaceholder,
            {
              borderColor: theme.colors.border + "d9",
              backgroundColor: theme.colors.surface,
            },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
            Назад
          </Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              borderColor: theme.colors.danger + "59",
              backgroundColor: theme.colors.surface,
            },
            pressed && styles.buttonPressed,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.danger }]}>
            {CREATE_PRODUCT_UI.CANCEL}
          </Text>
        </Pressable>
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
            {primaryLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );

  if (isEdit) {
    if (productQuery.isPending) {
      return (
        <ProductModalShell
          title={CREATE_PRODUCT_UI.EDIT_TITLE}
          onClose={handleCancel}
          scrollBody={false}
          fullScreen
        >
          <ScreenLoadingState />
        </ProductModalShell>
      );
    }

    if (productQuery.isError || !productQuery.data) {
      return (
        <ProductModalShell
          title={CREATE_PRODUCT_UI.EDIT_TITLE}
          onClose={handleCancel}
          scrollBody={false}
          fullScreen
        >
          <ScreenErrorState
            message={formatApiErrorMessage(
              productQuery.error,
              API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK,
            )}
            onRetry={() => productQuery.refetch()}
          />
        </ProductModalShell>
      );
    }

    return (
      <ProductModalShell
        title={CREATE_PRODUCT_UI.EDIT_TITLE}
        onClose={handleCancel}
        footer={renderFooter(true)}
        fullScreen
      >
        {renderWizardBody()}
      </ProductModalShell>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView
        style={[styles.body, { backgroundColor: theme.colors.bg }]}
        contentContainerStyle={[styles.bodyContent, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        automaticallyAdjustsScrollIndicatorInsets
      >
        {renderWizardBody()}
        <View style={styles.footerSpacer} />
        {renderFooter(false)}
      </ScrollView>
    </SafeAreaView>
  );
};

export const CreateProductScreen = () => <ProductWizardScreen mode="create" />;

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
    <View
      style={[
        progressStyles.card,
        {
          backgroundColor: theme.colors.actionSurface,
          borderColor: theme.colors.action + "1f", // 12% opacity
        },
      ]}
    >
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
              <View
                style={[
                  progressStyles.circle,
                  isActive && {
                    backgroundColor: theme.colors.action,
                    borderColor: theme.colors.action,
                  },
                  isComplete && {
                    backgroundColor: theme.colors.success + "24", // 14%
                    borderColor: theme.colors.success,
                  },
                  !isActive &&
                    !isComplete && {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border + "cc",
                    },
                ]}
              >
                <Text
                  style={[
                    progressStyles.circleText,
                    isActive && { color: theme.colors.onContrast },
                    isComplete && { color: theme.colors.success },
                    !isActive && !isComplete && { color: theme.colors.textSecondary },
                  ]}
                >
                  {isComplete ? "✓" : String(i + 1)}
                </Text>
              </View>
              {/* Step label */}
              <Text
                style={[
                  progressStyles.stepLabel,
                  { color: theme.colors.textSecondary },
                ]}
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
    if (form.characteristicRows.length >= PRODUCT_CHARACTERISTICS_MAX_ITEMS) return;
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
          Название <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <TextInput
          {...textInputFocusScrollProps}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
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
          Описание <Text style={{ color: theme.colors.danger }}>*</Text>
        </Text>
        <ProductDescriptionField
          value={form.productDescription}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, productDescription: text }))
          }
          disabled={disabled}
          maxLength={PRODUCT_DESCRIPTION_MAX_CHARS}
          placeholder="Состояние, комплектация, особенности…"
          inputStyle={[
            styles.input,
            styles.textarea,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        />
        {/* Char meter — mirrors .create-product-section__char-meter */}
        <Text
          style={[
            styles.charMeter,
            { color: overLimit ? theme.colors.danger : theme.colors.textSecondary },
          ]}
        >
          {`Символов: ${descLen} / ${PRODUCT_DESCRIPTION_MAX_CHARS}`}
        </Text>
      </View>

      {/* Characteristics — mirrors ProductCharacteristicsEditor */}
      <View style={styles.fieldLabel}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Характеристики</Text>
        {form.characteristicRows.map((row) => (
          <View
            key={row.id}
            style={[
              styles.charRow,
              {
                borderColor: `${theme.colors.border}cc`,
                backgroundColor: theme.colors.surfaceMuted,
              },
            ]}
          >
            <TextInput
              {...textInputFocusScrollProps}
              style={[
                styles.charInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: `${theme.colors.border}d9`,
                },
              ]}
              value={row.key}
              onChangeText={(text) => updateCharRow(row.id, "key", text)}
              editable={!disabled}
              placeholder="Свойство"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS}
            />
            <TextInput
              {...textInputFocusScrollProps}
              style={[
                styles.charInput,
                styles.charInputValue,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: `${theme.colors.border}d9`,
                },
              ]}
              value={row.value}
              onChangeText={(text) => updateCharRow(row.id, "value", text)}
              editable={!disabled}
              placeholder="Значение"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS}
            />
            <Pressable
              style={[
                styles.charRemoveBtn,
                {
                  borderColor: `${theme.colors.border}d9`,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={() => removeCharRow(row.id)}
              disabled={disabled}
            >
              <Text style={[styles.charRemoveText, { color: theme.colors.danger }]}>
                ✕
              </Text>
            </Pressable>
          </View>
        ))}
        {form.characteristicRows.length < PRODUCT_CHARACTERISTICS_MAX_ITEMS ? (
          <Pressable
            style={({ pressed }) => [
              styles.charAddButton,
              {
                borderColor: pressed ? theme.colors.action : theme.colors.actionBorder,
                backgroundColor: pressed
                  ? theme.colors.actionSoft
                  : theme.colors.actionSurface,
              },
            ]}
            onPress={addCharRow}
            disabled={disabled}
          >
            <Text style={[styles.charAddButtonText, { color: theme.colors.action }]}>
              + Добавить характеристику
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ─── OriginalityStep ──────────────────────────────────────────────────────────

function OriginalityStep({ form, setForm, disabled, theme, styles }: StepProps) {
  return (
    <View style={styles.section}>
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        {CREATE_PRODUCT_UI.WIZARD_STEP_ORIGINALITY_SUBTITLE}
      </Text>
      <ProductListingOriginChips
        value={form.productListingOrigin}
        onChange={(productListingOrigin) =>
          setForm((prev) => ({ ...prev, productListingOrigin }))
        }
        disabled={disabled}
        showLabel={false}
      />
    </View>
  );
}

// ─── MediaStep ────────────────────────────────────────────────────────────────

function MediaStep({ form, setForm, disabled, theme, styles }: StepProps) {
  return (
    <View style={styles.section}>
      <ProductPhotoGrid
        urls={form.imageUrls}
        onChange={(urls) => setForm((prev) => ({ ...prev, imageUrls: urls }))}
        maxCount={PRODUCT_IMAGE_URLS_MAX}
        disabled={disabled}
      />

      <ProductPreviewVideoUploadField
        value={form.productPreviewVideoUrl}
        onChange={(url) =>
          setForm((prev) => ({ ...prev, productPreviewVideoUrl: url }))
        }
        disabled={disabled}
      />
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

      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        {CREATE_PRODUCT_UI.LABEL_SALE_REGION}
        {": "}
        {getRuRegionByCode(form.productRegionCode)?.name ||
          CREATE_PRODUCT_UI.HINT_SALE_REGION_FROM_ADDRESS}
      </Text>
    </View>
  );
}

// ─── PickupStep ───────────────────────────────────────────────────────────────

function PickupStep({
  form,
  setForm,
  disabled,
  savedAddresses,
}: {
  form: WizardForm;
  setForm: React.Dispatch<React.SetStateAction<WizardForm>>;
  disabled: boolean;
  savedAddresses: SavedAddressPickerItem[];
}) {
  return (
    <View style={{ gap: 16 }}>
      <ProductPickupLocationFields
        savedAddresses={savedAddresses}
        pickupLocations={form.productPickupLocations}
        onPickupLocationsChange={(productPickupLocations) => {
          setForm((prev) => ({ ...prev, productPickupLocations }));
        }}
        address={form.productPickupAddress}
        lat={form.productPickupLat}
        lon={form.productPickupLon}
        pickupEnabled={form.productPickupEnabled !== false}
        deliveryEnabled={form.productDeliveryEnabled === true}
        selectedFromSuggest={form.productPickupSelectedFromSuggest}
        disabled={disabled}
        addressLineDisplayOnly
        onChange={(next) => {
          setForm((prev) => ({
            ...prev,
            productPickupAddress: next.productPickupAddress,
            productPickupLat: next.productPickupLat,
            productPickupLon: next.productPickupLon,
            productPickupEnabled: next.productPickupEnabled !== false,
            productDeliveryEnabled: next.productDeliveryEnabled === true,
            productPickupSelectedFromSuggest:
              next.productPickupSelectedFromSuggest === true,
            ...(next.productRegionCode
              ? { productRegionCode: next.productRegionCode }
              : {}),
          }));
        }}
      />
    </View>
  );
}

// ─── CommerceStep ─────────────────────────────────────────────────────────────

function CommerceStep({
  form,
  setForm,
  disabled,
  theme,
  styles,
  showCatalogAvailabilityToggle = true,
  isEdit = false,
}: StepProps & { showCatalogAvailabilityToggle?: boolean; isEdit?: boolean }) {
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
            Цена, ₽ <Text style={{ color: theme.colors.danger }}>*</Text>
          </Text>
          <TextInput
            {...textInputFocusScrollProps}
            style={[
              styles.input,
              styles.priceInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={form.productPrice}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, productPrice: formatRubPriceInput(text) }))
            }
            editable={!disabled}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
        <View style={[styles.fieldLabel, styles.priceCol]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Старая цена, ₽
          </Text>
          <TextInput
            {...textInputFocusScrollProps}
            style={[
              styles.input,
              styles.priceInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={form.productOldPrice}
            onChangeText={(text) =>
              setForm((prev) => ({
                ...prev,
                productOldPrice: formatRubPriceInput(text),
              }))
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
        <View
          style={[
            styles.discountPreview,
            { backgroundColor: theme.colors.success + "1f" },
          ]}
        >
          <Text style={[styles.discountPreviewText, { color: theme.colors.success }]}>
            {`Скидка: −${discountPercent}%`}
          </Text>
        </View>
      ) : null}

      {/* Availability toggle — mirrors .create-product-section__check */}
      {showCatalogAvailabilityToggle ? (
        <View style={styles.checkRow}>
          <Switch
            value={form.productIsAvailable}
            onValueChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                productIsAvailable: checked,
                productStockQuantity:
                  checked && !prev.productStockQuantity.trim()
                    ? "1"
                    : prev.productStockQuantity,
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
      ) : null}

      {/* Stock quantity */}
      {form.productIsAvailable || isEdit ? (
        <View style={styles.fieldLabel}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Количество, шт. <Text style={{ color: theme.colors.danger }}>*</Text>
          </Text>
          <TextInput
            {...textInputFocusScrollProps}
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
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
    </View>
  );
}

// ─── ReturnsStep ──────────────────────────────────────────────────────────────

function ReturnsStep({ form, setForm, disabled, theme, styles }: StepProps) {
  const yesSelected = form.productReturnEnabled === true;
  const noSelected = form.productReturnEnabled === false;

  const addReturnRow = () => {
    if (form.returnTermRows.length >= PRODUCT_RETURN_TERMS_MAX_ITEMS) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      returnTermRows: [...prev.returnTermRows, createProductReturnTermRow()],
    }));
  };

  const removeReturnRow = (id: number) => {
    setForm((prev) => ({
      ...prev,
      returnTermRows: prev.returnTermRows.filter((row) => row.id !== id),
    }));
  };

  const updateReturnRow = (id: number, field: "key" | "value", text: string) => {
    setForm((prev) => ({
      ...prev,
      returnTermRows: prev.returnTermRows.map((row) =>
        row.id === id ? { ...row, [field]: text } : row,
      ),
    }));
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Возврат <Text style={{ color: theme.colors.danger }}>*</Text>
      </Text>
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        {CREATE_PRODUCT_UI.WIZARD_STEP_RETURNS_SUBTITLE}
      </Text>

      <View style={styles.returnChoiceRow}>
        <Pressable
          disabled={disabled}
          onPress={() =>
            setForm((prev) => ({
              ...prev,
              productReturnEnabled: true,
              returnTermRows:
                prev.returnTermRows.length > 0
                  ? prev.returnTermRows
                  : [createProductReturnTermRow()],
            }))
          }
          style={[
            styles.returnChoiceChip,
            {
              borderColor: yesSelected ? theme.colors.action : theme.colors.border,
              backgroundColor: yesSelected ? theme.colors.action : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.returnChoiceChipText,
              { color: yesSelected ? theme.colors.onContrast : theme.colors.text },
            ]}
          >
            Да
          </Text>
        </Pressable>
        <Pressable
          disabled={disabled}
          onPress={() =>
            setForm((prev) => ({
              ...prev,
              productReturnEnabled: false,
              returnTermRows: [],
            }))
          }
          style={[
            styles.returnChoiceChip,
            {
              borderColor: noSelected ? theme.colors.action : theme.colors.border,
              backgroundColor: noSelected ? theme.colors.action : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.returnChoiceChipText,
              { color: noSelected ? theme.colors.onContrast : theme.colors.text },
            ]}
          >
            Нет
          </Text>
        </Pressable>
      </View>

      {yesSelected ? (
        <View style={styles.returnTermBlock}>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            Пример: возврат в течение — 15 дней
          </Text>
          {form.returnTermRows.map((row) => (
            <View
              key={row.id}
              style={[
                styles.charRow,
                {
                  borderColor: `${theme.colors.border}cc`,
                  backgroundColor: theme.colors.surfaceMuted,
                },
              ]}
            >
              <TextInput
                {...textInputFocusScrollProps}
                style={[
                  styles.charInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    borderColor: `${theme.colors.border}d9`,
                  },
                ]}
                value={row.key}
                onChangeText={(text) => updateReturnRow(row.id, "key", text)}
                editable={!disabled}
                placeholder="Свойство"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={PRODUCT_RETURN_TERM_KEY_MAX}
              />
              <TextInput
                {...textInputFocusScrollProps}
                style={[
                  styles.charInput,
                  styles.charInputValue,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    borderColor: `${theme.colors.border}d9`,
                  },
                ]}
                value={row.value}
                onChangeText={(text) => updateReturnRow(row.id, "value", text)}
                editable={!disabled}
                placeholder="Значение"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={PRODUCT_RETURN_TERM_VALUE_MAX}
              />
              <Pressable
                style={[
                  styles.charRemoveBtn,
                  {
                    borderColor: `${theme.colors.border}d9`,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() => removeReturnRow(row.id)}
                disabled={disabled}
              >
                <Text style={[styles.charRemoveText, { color: theme.colors.danger }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))}
          {form.returnTermRows.length < PRODUCT_RETURN_TERMS_MAX_ITEMS ? (
            <Pressable
              style={({ pressed }) => [
                styles.charAddButton,
                {
                  borderColor: pressed
                    ? theme.colors.action
                    : theme.colors.actionBorder,
                  backgroundColor: pressed
                    ? theme.colors.actionSoft
                    : theme.colors.actionSurface,
                },
              ]}
              onPress={addReturnRow}
              disabled={disabled}
            >
              <Text style={[styles.charAddButtonText, { color: theme.colors.action }]}>
                + Добавить условие
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ─── ReviewStep ───────────────────────────────────────────────────────────────

function ReviewStep({
  form,
  onEditStep,
  theme,
  styles,
  isEdit = false,
}: {
  form: WizardForm;
  onEditStep: (index: number) => void;
  theme: ReturnType<typeof useAppTheme>;
  styles: ReturnType<typeof useStyles>;
  isEdit?: boolean;
}) {
  const imageCount = form.imageUrls.filter(Boolean).length;
  const discountPercent = computeDiscount(form.productPrice, form.productOldPrice);

  const rows: Array<{
    label: string;
    value: string;
    stepIndex: number;
    multiline?: boolean;
  }> = [
    { label: "Название", value: form.productName.trim() || "—", stepIndex: 1 },
    {
      label: "Описание",
      value: form.productDescription.trim() || "—",
      stepIndex: 1,
      multiline: true,
    },
    {
      label: CREATE_PRODUCT_UI.LABEL_LISTING_ORIGIN,
      value: isProductListingOrigin(form.productListingOrigin)
        ? (PRODUCT_LISTING_ORIGIN_OPTIONS.find(
            (option) => option.value === form.productListingOrigin,
          )?.label ?? "—")
        : "—",
      stepIndex: 2,
    },
    {
      label: "Фото и видео",
      value:
        imageCount > 0
          ? `${imageCount} фото${form.productPreviewVideoUrl.trim() ? " + видео" : ""}`
          : form.productPreviewVideoUrl.trim()
            ? "Только видео"
            : "Нет фото",
      stepIndex: 3,
    },
    { label: "Категория", value: form.productCategoryLabel || "—", stepIndex: 0 },
    {
      label: CREATE_PRODUCT_UI.LABEL_SALE_REGION,
      value:
        getRuRegionByCode(form.productRegionCode)?.name ||
        form.productRegionCode ||
        "—",
      stepIndex: 0,
    },
    {
      label: "Адрес самовывоза",
      value:
        pickupLocationsSummary(form.productPickupLocations, form.productPickupAddress) ||
        "—",
      stepIndex: 4,
      multiline: true,
    },
    {
      label: "Цена, ₽",
      value: `${form.productPrice.trim() || "0"} ₽${discountPercent != null ? ` (−${discountPercent}%)` : ""}`,
      stepIndex: 5,
    },
    {
      label: "Количество",
      value: form.productIsAvailable
        ? `${form.productStockQuantity.trim()} шт.`
        : "Скрыт из каталога",
      stepIndex: 5,
    },
    {
      label: "Возврат",
      value:
        form.productReturnEnabled === true
          ? serializeProductReturnTermRows(form.returnTermRows)
              .map((term) => `${term.key}: ${term.value}`)
              .join("; ") || "—"
          : form.productReturnEnabled === false
            ? "Нет"
            : "—",
      stepIndex: 6,
      multiline: true,
    },
  ];

  return (
    <View style={styles.section}>
      {/* Lead */}
      <Text style={[styles.lead, { color: theme.colors.textSecondary }]}>
        {isEdit
          ? "Проверьте данные перед сохранением. Любой блок можно изменить."
          : "Проверьте данные перед публикацией. Любой блок можно изменить."}
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

  // Body — mirrors .create-product-wizard__body
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20, // 1.25rem
    paddingTop: 20,
    gap: 16, // 1rem
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: 16,
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
    gap: 8,
    alignItems: "center",
    width: "100%",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  // flexBasis 0 + minWidth 0 — иначе RN Web TextInput игнорирует flex и оба поля ~равны intrinsic width
  charInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  charInputValue: {
    flexGrow: 1.5,
  },
  charRemoveBtn: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 7, // 0.45rem
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  charRemoveText: {
    fontSize: 13,
    fontWeight: "700",
  },
  charAddButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  charAddButtonText: {
    fontSize: 14,
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

  returnChoiceRow: {
    flexDirection: "row",
    gap: 10,
  },
  returnChoiceChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  returnChoiceChipText: {
    fontSize: 15,
    fontWeight: "700",
  },
  returnTermBlock: {
    gap: 12,
    marginTop: 4,
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
    flexDirection: "row",
    gap: 10, // 0.65rem
    marginHorizontal: -20, // bleed to screen edges inside body padding
    paddingHorizontal: 20, // 1.25rem
    paddingTop: 12, // ~var(--iz-space-3)
    borderTopWidth: 1,
  },
  footerInModal: {
    flexDirection: "row",
    gap: 10,
  },
  backButtonPlaceholder: {
    opacity: 0.55,
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
