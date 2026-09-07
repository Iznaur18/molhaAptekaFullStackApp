import { createHash } from "node:crypto";

/**
 * Отпечатки содержимого карточки.
 *
 * Нужны двум разным вещам, поэтому отпечатка два:
 *
 *  - `product1cContentHash` — «что 1С прислала в прошлый раз». Полная выгрузка
 *    приходит целиком и по расписанию (у живых продавцов — десятки раз в
 *    сутки), а меняются в ней единицы позиций. Без сверки каждый обмен
 *    переписывал бы весь каталог: лишние записи в Mongo, сдвинутый `updatedAt`
 *    у тысяч карточек и бессмысленная работа для всего, что на него смотрит.
 *
 *  - `productModerationApprovedHash` — «что именно одобрил модератор».
 *    По нему видно, изменилось ли с тех пор то, что человек действительно
 *    смотрел (название, описание, фото, категория), или приехали только цена и
 *    остаток. Цена и остаток в отпечаток НЕ входят намеренно: иначе каждый
 *    привоз возвращал бы одобренный каталог в очередь.
 */

/**
 * Канонический вид значения: ключи объектов отсортированы, поэтому один и тот
 * же набор полей даёт одну и ту же строку независимо от порядка вставки.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value instanceof Date) return value.toISOString();
  // ObjectId: без явной ветки он разбирался бы по внутренностям bson (`buffer`
  // с числовыми ключами) — работает, но зависит от версии драйвера.
  if (typeof (/** @type {any} */ (value)?.toHexString) === "function") {
    return /** @type {any} */ (value).toHexString();
  }
  if (value && typeof value === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const key of Object.keys(value).sort()) {
      const item = canonicalize(/** @type {Record<string, unknown>} */ (value)[key]);
      if (item === undefined) continue;
      out[key] = item;
    }
    return out;
  }
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return String(value);
  return value;
}

/**
 * @param {unknown} value
 * @returns {string} sha1-hex
 */
export function hashStableValue(value) {
  return createHash("sha1")
    .update(JSON.stringify(canonicalize(value)) ?? "null")
    .digest("hex");
}

/**
 * Поля, ради которых карточку смотрит человек. Всё остальное (цена, остаток,
 * доступность, адрес самовывоза, служебные метки обмена) модерации не касается.
 *
 * @param {{
 *   productName?: unknown;
 *   productDescription?: unknown;
 *   productImageUrls?: unknown;
 *   productPreviewVideoUrl?: unknown;
 *   productCategoryId?: unknown;
 *   productCharacteristics?: unknown;
 * } | null | undefined} product
 * @returns {string}
 */
export function buildProductModerationFingerprint(product) {
  const characteristics = Array.isArray(product?.productCharacteristics)
    ? product.productCharacteristics.map((row) => [
        String(row?.key ?? ""),
        String(row?.value ?? ""),
      ])
    : [];

  return hashStableValue({
    name: String(product?.productName ?? "").trim(),
    description: String(product?.productDescription ?? "").trim(),
    images: Array.isArray(product?.productImageUrls)
      ? product.productImageUrls.map(String)
      : [],
    video: String(product?.productPreviewVideoUrl ?? ""),
    category: product?.productCategoryId ? String(product.productCategoryId) : "",
    characteristics,
  });
}
