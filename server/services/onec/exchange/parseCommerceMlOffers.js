import {
  ONEC_EXTERNAL_ID_MAX_LENGTH,
  ONEC_IMPORT_BATCH_SIZE,
} from "../../../constants/onecExchangeConstants.js";
import { ONEC_ARTICLE_MAX_LENGTH } from "../../../constants/onecConstants.js";
import { childList, childText, streamXmlElements } from "./streamXmlElements.js";

/**
 * @typedef {{ externalId: string; name: string }} OneCDictionaryEntry
 *
 * @typedef {{
 *   externalId: string;
 *   article: string;
 *   name: string;
 *   prices: Array<{ priceTypeId: string; value: number }>;
 *   totalQuantity: number | null;
 *   warehouseQuantities: Array<{ warehouseId: string; quantity: number }>;
 * }} OneCOffer
 */

/** @param {string} value @param {number} max */
const clamp = (value, max) => String(value ?? "").trim().slice(0, max);

/**
 * 1С пишет дробные с запятой при некоторых региональных настройках, а разряды
 * иногда разделяет пробелом/NBSP. `Number()` на таком возвращает NaN.
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
export function parseOneCNumber(raw) {
  const text = String(raw ?? "")
    .replace(/[\s\u00A0]/g, "")
    .replace(",", ".")
    .trim();
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/**
 * Атрибут по любому из имён — CommerceML 2.03…2.10 переименовывали их
 * (`Ид` → `ИдСклада`, `Наименование` → `НаименованиеСклада`).
 *
 * @param {Record<string, unknown>} node
 * @param {string[]} names
 */
function attr(node, names) {
  const attrs = /** @type {{ $?: Record<string, string> }} */ (node).$ ?? {};
  for (const name of names) {
    const value = attrs[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * @param {Record<string, unknown>} node
 * @returns {OneCOffer | null}
 */
function toOffer(node) {
  const externalId = clamp(childText(node, "Ид"), ONEC_EXTERNAL_ID_MAX_LENGTH);
  if (!externalId) return null;

  /** @type {Array<{ priceTypeId: string; value: number }>} */
  const prices = [];
  for (const container of childList(node, "Цены")) {
    for (const row of childList(container, "Цена")) {
      const value = parseOneCNumber(childText(row, "ЦенаЗаЕдиницу"));
      if (value === null || value < 0) continue;
      prices.push({
        priceTypeId: childText(row, "ИдТипаЦены"),
        value,
      });
    }
  }

  /** @type {Array<{ warehouseId: string; quantity: number }>} */
  const warehouseQuantities = [];
  for (const row of childList(node, "Склад")) {
    const warehouseId = attr(row, ["ИдСклада", "Ид"]);
    const quantity = parseOneCNumber(
      attr(row, ["КоличествоНаСкладе", "Количество"]),
    );
    if (!warehouseId || quantity === null) continue;
    warehouseQuantities.push({ warehouseId, quantity: Math.max(0, quantity) });
  }

  const totalRaw =
    childText(node, "Количество") || childText(node, "КоличествоНаСкладе");
  const total = parseOneCNumber(totalRaw);

  return {
    externalId,
    article: clamp(childText(node, "Артикул"), ONEC_ARTICLE_MAX_LENGTH),
    name: childText(node, "Наименование"),
    prices,
    totalQuantity: total === null ? null : Math.max(0, total),
    warehouseQuantities,
  };
}

/**
 * Разбор `offers.xml` (пакет предложений CommerceML) в один потоковый проход.
 *
 * `ТипыЦен` и `Склады` объявлены до `Предложения`, поэтому справочники уходят
 * в `onDictionaries` раньше первой партии предложений — обработчик успевает
 * сузить фильтр продавца до нужного типа цены и складов.
 *
 * @param {{
 *   filePath: string;
 *   onDictionaries?: (dicts: {
 *     priceTypes: OneCDictionaryEntry[];
 *     warehouses: OneCDictionaryEntry[];
 *   }) => Promise<void> | void;
 *   onOffers: (offers: OneCOffer[]) => Promise<void> | void;
 * }} params
 * @returns {Promise<{ priceTypes: number; warehouses: number; offers: number }>}
 */
export async function parseCommerceMlOffers({
  filePath,
  onDictionaries,
  onOffers,
}) {
  /** @type {OneCDictionaryEntry[]} */
  const priceTypes = [];
  /** @type {OneCDictionaryEntry[]} */
  const warehouses = [];
  let offerCount = 0;
  let dictionariesFlushed = false;

  const flushDictionaries = async () => {
    if (dictionariesFlushed) return;
    dictionariesFlushed = true;
    if (onDictionaries) await onDictionaries({ priceTypes, warehouses });
  };

  /** @type {OneCOffer[]} */
  let buffer = [];

  await streamXmlElements({
    filePath,
    capture: ["ТипЦены", "Склад", "Предложение"],
    batchSize: ONEC_IMPORT_BATCH_SIZE,
    onBatch: async (nodes) => {
      for (const node of nodes) {
        if (node.__name === "ТипЦены") {
          const externalId = childText(node, "Ид");
          if (!externalId) continue;
          priceTypes.push({
            externalId,
            name: childText(node, "Наименование") || externalId,
          });
          continue;
        }

        if (node.__name === "Склад") {
          // Внутри `<Предложение>` склад приходит как ребёнок и сюда не попадает —
          // верхнеуровневый `<Склад>` встречается только в справочнике `Склады`.
          const externalId = attr(node, ["Ид", "ИдСклада"]);
          if (!externalId) continue;
          warehouses.push({
            externalId,
            name:
              attr(node, ["Наименование", "НаименованиеСклада"]) ||
              childText(node, "Наименование") ||
              externalId,
          });
          continue;
        }

        if (node.__name !== "Предложение") continue;
        await flushDictionaries();
        const offer = toOffer(node);
        if (!offer) continue;
        buffer.push(offer);
        offerCount += 1;
      }

      if (buffer.length >= ONEC_IMPORT_BATCH_SIZE) {
        const batch = buffer;
        buffer = [];
        await onOffers(batch);
      }
    },
  });

  await flushDictionaries();
  if (buffer.length > 0) {
    await onOffers(buffer);
  }

  return {
    priceTypes: priceTypes.length,
    warehouses: warehouses.length,
    offers: offerCount,
  };
}
