import { normalizeProductPromotionAmountRub } from "@molha/api-contract";

import { PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT } from "../../constants/productPromotionConstants.js";

/**
 * Чинит заявки на продвижение, которые нельзя было оплатить.
 *
 * Цена считалась как доля от цены товара без округления, и у дешёвого товара
 * уходила ниже рубля: сутки «Золота» на товар за 1 ₽ стоили 0.002 ₽. Заявка
 * создавалась, счёт по ней округлялся в ноль, платёжный слой отбивал его как
 * нулевой — и продвижение висело в ожидании оплаты навсегда.
 *
 * Трогаем только `awaiting_payment`: там деньги ещё не приходили, и цену можно
 * привести к оплачиваемой. Уже активные и закрытые заявки — история того, что
 * реально списали, её переписывать нельзя.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const promotions = db.collection("productpromotions");

  const candidates = await promotions
    .find(
      { status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT },
      { projection: { amountRub: 1 } },
    )
    .toArray();

  const fixes = candidates
    .map((promotion) => ({
      _id: promotion._id,
      from: Number(promotion.amountRub) || 0,
      to: normalizeProductPromotionAmountRub(promotion.amountRub),
    }))
    .filter((row) => row.to > 0 && row.to !== row.from);

  if (!isApply) {
    return {
      awaitingPayment: candidates.length,
      wouldFix: fixes.length,
      sample: fixes.slice(0, 5).map((row) => `${row.from} → ${row.to}`),
    };
  }

  let modified = 0;
  for (const row of fixes) {
    const result = await promotions.updateOne(
      { _id: row._id, status: PRODUCT_PROMOTION_STATUS_AWAITING_PAYMENT },
      { $set: { amountRub: row.to } },
    );
    modified += result.modifiedCount;
  }

  return { awaitingPayment: candidates.length, matched: fixes.length, modified };
}
