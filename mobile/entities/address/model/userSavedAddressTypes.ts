import type { RuDeliveryAddressValue } from "@/entities/address/model/types";

/**
 * Сохранённый адрес в форме профиля: адрес доставки + метка, id и признак
 * «по умолчанию». Порт `client/.../model/userSavedAddressTypes.js`.
 */
export type UserSavedAddressFormValue = RuDeliveryAddressValue & {
  id: string;
  label: string;
  isDefault: boolean;
};
