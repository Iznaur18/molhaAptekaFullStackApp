/**
 * Причина, по которой каталог пуст.
 *
 * Возвращаем ключ, а не готовый текст: так функция не тянет `@/shared/config`
 * и её можно гонять юнит-тестом напрямую, а копирайт остаётся в одном месте.
 */
export type CatalogEmptyReason =
  | "query"
  | "near"
  | "sale"
  | "rental"
  | "affiliate"
  | "wholesale"
  | "original"
  | "installment"
  | "following"
  | "mineByModerationStatus"
  | "mineFiltered"
  | "mine"
  | "category"
  | "generic";

export type CatalogEmptyContext = {
  hasQuery?: boolean;
  isMineMode?: boolean;
  hasSelectedCategory?: boolean;
  hasModerationFilter?: boolean;
  near?: boolean;
  saleOnly?: boolean;
  rentalOnly?: boolean;
  affiliateOnly?: boolean;
  wholesaleOnly?: boolean;
  originalOnly?: boolean;
  installmentOnly?: boolean;
  followingOnly?: boolean;
  auctionOnly?: boolean;
};

/**
 * Порядок проверок повторяет вебовский `HomeCatalogGrid` — он не произвольный:
 * поисковый запрос перебивает любой фильтр, а фильтры перебирают категорию,
 * иначе продавец с включённым «только опт» видел бы «в категории товаров нет»
 * и не понимал, что виноват фильтр.
 *
 * Фильтры «N+1» и «горящая скидка» своего текста не имеют — их нет и в вебе,
 * они падают в общий `generic`. Специально не расходимся.
 */
export const resolveCatalogEmptyReason = (
  context: CatalogEmptyContext,
): CatalogEmptyReason => {
  const isMine = context.isMineMode === true;

  if (context.hasQuery === true) {
    return "query";
  }

  if (!isMine) {
    if (context.near === true) {
      return "near";
    }
    if (context.saleOnly === true) {
      return "sale";
    }
    if (context.rentalOnly === true) {
      return "rental";
    }
    if (context.affiliateOnly === true) {
      return "affiliate";
    }
    if (context.wholesaleOnly === true) {
      return "wholesale";
    }
    if (context.originalOnly === true) {
      return "original";
    }
    if (context.installmentOnly === true) {
      return "installment";
    }
    // Аукцион в вебе делит текст с подписками — отдельного нет.
    if (context.followingOnly === true || context.auctionOnly === true) {
      return "following";
    }
  }

  if (isMine) {
    if (context.hasModerationFilter === true) {
      return "mineByModerationStatus";
    }
    return context.hasSelectedCategory === true ? "mineFiltered" : "mine";
  }

  return context.hasSelectedCategory === true ? "category" : "generic";
};
