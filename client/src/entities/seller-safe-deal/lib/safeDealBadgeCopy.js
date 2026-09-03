import { SAFE_DEAL_BADGE_UI } from "../../../shared/config/appUiCopy.js";
import { IS_SAFE_DEAL_ESCROW_ENABLED } from "../model/isSafeDealEscrowEnabled.js";

/**
 * Подписи значка на витрине под текущее состояние площадки.
 *
 * Одна точка входа, чтобы карточка, детали и профиль не разъехались в
 * обещаниях: либо везде «Безопасная сделка», либо везде «Продавец проверен».
 *
 * @returns {{ LABEL: string; SHORT_ARIA: string; TITLE: string; EXPLAIN: string }}
 */
export function resolveSafeDealBadgeCopy() {
  return IS_SAFE_DEAL_ESCROW_ENABLED
    ? SAFE_DEAL_BADGE_UI.ESCROW
    : SAFE_DEAL_BADGE_UI.VERIFIED_ONLY;
}
