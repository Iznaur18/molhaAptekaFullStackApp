import { createSealedSecretBox } from "../sealedSecretBox.js";

/**
 * Токен Яндекс Доставки продавца — в базе только зашифрованным. Ключ
 * шифрования общий с СДЭК (CDEK_CREDENTIALS_KEK): он один на все чужие
 * ключи служб доставки, отдельная переменная ничего бы не добавила.
 */
const box = createSealedSecretBox({
  marker: "__yadlv",
  salt: "izibuy-yandex-delivery-credentials-v1",
  kekEnvName: "CDEK_CREDENTIALS_KEK",
  label: "Токен Яндекс Доставки",
});

export const sealYandexDeliveryToken = box.seal;
export const openYandexDeliveryToken = box.open;
export const yandexDeliveryTokenNeedsReseal = box.needsReseal;
