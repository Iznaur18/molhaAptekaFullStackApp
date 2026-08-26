type CharacteristicRowLike = {
  key: string;
  value: string;
};

type CategoryCharacteristicsState = {
  productCategoryId: string | null;
  categoryDefaultCharacteristicKeys: readonly string[];
  characteristicRows: readonly CharacteristicRowLike[];
  characteristicsSellerTouched: boolean;
  characteristicsAutoAppliedForCategoryId: string | null;
};

/**
 * Ключи характеристик, заданные админом категории, подставляются пустыми
 * строками — как в вебе (`resolveCategoryDefaultCharacteristicRowsPatch`).
 * Без этого продавец на телефоне печатал названия свойств с нуля, и ключи
 * по товарам одной категории расходились.
 *
 * Возвращает `null`, когда трогать строки нельзя:
 * — продавец уже правил их руками (его ввод важнее заготовки);
 * — для этой же категории подстановка уже была (иначе повторный вход на шаг
 *   затирал бы заполненные значения).
 *
 * @returns патч для формы или `null`, если ничего менять не нужно
 */
export const resolveCategoryDefaultCharacteristicRows = (
  state: CategoryCharacteristicsState,
): {
  characteristicRows: CharacteristicRowLike[];
  characteristicsAutoAppliedForCategoryId: string | null;
  characteristicsSellerTouched: false;
} | null => {
  if (state.characteristicsSellerTouched) {
    return null;
  }

  const categoryId = String(state.productCategoryId ?? "").trim() || null;
  const appliedFor =
    String(state.characteristicsAutoAppliedForCategoryId ?? "").trim() || null;

  if (categoryId != null && appliedFor === categoryId) {
    return null;
  }

  // Категории нет и подстановки не было — чистить нечего.
  if (categoryId == null && appliedFor == null && state.characteristicRows.length === 0) {
    return null;
  }

  const keys = state.categoryDefaultCharacteristicKeys
    .map((key) => String(key ?? "").trim())
    .filter(Boolean);

  return {
    characteristicRows: keys.map((key) => ({ key, value: "" })),
    characteristicsAutoAppliedForCategoryId: categoryId,
    characteristicsSellerTouched: false,
  };
};
