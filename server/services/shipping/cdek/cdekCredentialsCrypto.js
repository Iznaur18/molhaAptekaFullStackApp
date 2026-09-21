import { createSealedSecretBox } from "../sealedSecretBox.js";

/**
 * Secure password продавца СДЭК лежит в базе только зашифрованным.
 * Механика — в sealedSecretBox.js; соль и метка остались прежними, поэтому
 * записи, сохранённые до выноса, открываются как раньше.
 */
const box = createSealedSecretBox({
  marker: "__cdek",
  salt: "izibuy-cdek-credentials-v1",
  kekEnvName: "CDEK_CREDENTIALS_KEK",
  label: "Secure password СДЭК",
});

export const isCdekSealedSecret = box.isSealed;
export const sealCdekSecret = box.seal;
export const openCdekSecret = box.open;
export const cdekSecretNeedsReseal = box.needsReseal;
