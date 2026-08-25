import type { RuDeliveryAddressValue } from "@/entities/address/model/types";

/**
 * Сохранённый адрес → значение поля доставки в чекауте.
 * Порт `client/src/entities/address/lib/deliveryAddressFromSaved.js`.
 */
type SavedAddressLike = {
  id?: string;
  label?: string;
  line?: string;
  flat?: string;
  fiasId?: string;
  geo?: { lat: number; lon: number } | null;
  isDefault?: boolean;
};

/** Псевдо-id пункта «указать другой адрес». */
export const CHECKOUT_SAVED_ADDRESS_CUSTOM_ID = "__custom__";

export const deliveryAddressFromSaved = (
  item: SavedAddressLike,
): RuDeliveryAddressValue => ({
  line: String(item.line ?? "").trim(),
  flat: String(item.flat ?? "").trim(),
  fiasId: String(item.fiasId ?? "").trim(),
  geo: item.geo ?? null,
  regionCode: null,
  // Адрес из книги уже был выбран из подсказок — иначе он бы не сохранился.
  selectedFromSuggest: String(item.line ?? "").trim().length > 0,
});

/** Что выбрано при открытии формы: адрес по умолчанию, иначе первый. */
export const resolveInitialCheckoutSavedAddressId = (
  addresses: SavedAddressLike[] | null | undefined,
): string => {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
  }
  const defaultItem = addresses.find((item) => item.isDefault) ?? addresses[0];
  return defaultItem?.id ?? CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
};

/**
 * Обратное сопоставление: человек правит поле руками — подсветка в списке
 * должна сама переехать на совпавший адрес или на «другой».
 */
export const matchCheckoutSavedAddressId = (
  deliveryAddress: Pick<RuDeliveryAddressValue, "line" | "flat">,
  addresses: SavedAddressLike[] | null | undefined,
): string => {
  const line = String(deliveryAddress.line ?? "").trim();
  const flat = String(deliveryAddress.flat ?? "").trim();
  if (!line) {
    return CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
  }

  const matched = (addresses ?? []).find(
    (item) =>
      String(item.line ?? "").trim() === line &&
      String(item.flat ?? "").trim() === flat,
  );

  return matched?.id ?? CHECKOUT_SAVED_ADDRESS_CUSTOM_ID;
};
