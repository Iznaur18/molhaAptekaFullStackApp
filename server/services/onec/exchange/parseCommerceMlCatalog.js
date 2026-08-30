import {
  ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
  ONEC_CATEGORY_NAME_MAX_LENGTH,
  ONEC_IMPORT_BATCH_SIZE,
  ONEC_IMPORT_MAX_CHARACTERISTICS,
  ONEC_IMPORT_MAX_IMAGES_PER_PRODUCT,
  ONEC_EXTERNAL_ID_MAX_LENGTH,
} from "../../../constants/onecExchangeConstants.js";
import {
  ONEC_ARTICLE_MAX_LENGTH,
  ONEC_DESCRIPTION_MAX_LENGTH,
  ONEC_NAME_MAX_LENGTH,
} from "../../../constants/onecConstants.js";
import { childList, childText, streamXmlElements } from "./streamXmlElements.js";

/**
 * @typedef {{
 *   externalId: string;
 *   name: string;
 *   parentExternalId: string | null;
 *   pathNames: string[];
 *   depth: number;
 * }} OneCGroup
 *
 * @typedef {{
 *   key: string;
 *   value: string;
 * }} OneCCharacteristic
 *
 * @typedef {{
 *   externalId: string;
 *   article: string;
 *   name: string;
 *   description: string;
 *   groupIds: string[];
 *   imagePaths: string[];
 *   characteristics: OneCCharacteristic[];
 *   deleted: boolean;
 * }} OneCCatalogProduct
 */

/** @param {string} value @param {number} max */
const clamp = (value, max) => String(value ?? "").trim().slice(0, max);

/**
 * `<Группа>` рекурсивна: развернуть в плоский список с путём от корня.
 *
 * @param {Record<string, unknown>} node
 * @param {string | null} parentExternalId
 * @param {string[]} parentPath
 * @param {OneCGroup[]} out
 */
function flattenGroup(node, parentExternalId, parentPath, out) {
  const externalId = clamp(
    childText(node, "Ид"),
    ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
  );
  const name = clamp(
    childText(node, "Наименование"),
    ONEC_CATEGORY_NAME_MAX_LENGTH,
  );
  if (!externalId) return;

  const pathNames = [...parentPath, name || externalId];
  out.push({
    externalId,
    name,
    parentExternalId,
    pathNames,
    depth: pathNames.length - 1,
  });

  for (const container of childList(node, "Группы")) {
    for (const child of childList(container, "Группа")) {
      flattenGroup(child, externalId, pathNames, out);
    }
  }
}

/**
 * Свойство считаем «удалённым», если 1С сказала это тегом или атрибутом.
 * Разные конфигурации пишут по-разному, встречаются оба варианта.
 *
 * @param {Record<string, unknown>} node
 */
function isDeleted(node) {
  const attrStatus = /** @type {{ $?: Record<string, string> }} */ (node).$
    ?.Статус;
  const tagStatus = childText(node, "Статус");
  return /удал/i.test(String(attrStatus ?? "")) || /удал/i.test(tagStatus);
}

/**
 * Свойства товара: `ЗначенияСвойств` ссылается на классификатор по Ид, поэтому
 * человекочитаемое имя берём из переданного справочника. `ЗначенияРеквизитов`
 * уже содержит наименование — берём как есть.
 *
 * @param {Record<string, unknown>} node
 * @param {Map<string, { name: string; values: Map<string, string> }>} propertyDict
 * @returns {OneCCharacteristic[]}
 */
function collectCharacteristics(node, propertyDict) {
  /** @type {OneCCharacteristic[]} */
  const out = [];

  for (const container of childList(node, "ЗначенияСвойств")) {
    for (const row of childList(container, "ЗначенияСвойства")) {
      const propertyId = childText(row, "Ид");
      const property = propertyDict.get(propertyId);
      const rawValue = childText(row, "Значение");
      if (!rawValue) continue;
      const value = property?.values.get(rawValue) ?? rawValue;
      const key = property?.name || propertyId;
      if (!key || !value) continue;
      out.push({ key, value });
    }
  }

  for (const container of childList(node, "ЗначенияРеквизитов")) {
    for (const row of childList(container, "ЗначениеРеквизита")) {
      const key = childText(row, "Наименование");
      const value = childText(row, "Значение");
      if (!key || !value) continue;
      out.push({ key, value });
    }
  }

  return out.slice(0, ONEC_IMPORT_MAX_CHARACTERISTICS);
}

/**
 * @param {Record<string, unknown>} node
 * @param {Map<string, { name: string; values: Map<string, string> }>} propertyDict
 * @returns {OneCCatalogProduct | null}
 */
function toCatalogProduct(node, propertyDict) {
  const externalId = clamp(childText(node, "Ид"), ONEC_EXTERNAL_ID_MAX_LENGTH);
  if (!externalId) return null;

  const groupIds = [];
  for (const container of childList(node, "Группы")) {
    for (const idNode of childList(container, "Ид")) {
      const value = clamp(
        typeof idNode?._ === "string" ? idNode._ : "",
        ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
      );
      if (value) groupIds.push(value);
    }
  }

  const imagePaths = [];
  for (const image of childList(node, "Картинка")) {
    const value = String(image?._ ?? "").trim();
    if (value) imagePaths.push(value);
    if (imagePaths.length >= ONEC_IMPORT_MAX_IMAGES_PER_PRODUCT) break;
  }

  return {
    externalId,
    article: clamp(childText(node, "Артикул"), ONEC_ARTICLE_MAX_LENGTH),
    name: clamp(childText(node, "Наименование"), ONEC_NAME_MAX_LENGTH),
    description: clamp(
      childText(node, "Описание"),
      ONEC_DESCRIPTION_MAX_LENGTH,
    ),
    groupIds,
    imagePaths,
    characteristics: collectCharacteristics(node, propertyDict),
    deleted: isDeleted(node),
  };
}

/**
 * Разбор `import.xml` (каталог CommerceML) в один потоковый проход.
 *
 * `Классификатор` в файле всегда идёт до `Каталог`, поэтому к моменту первого
 * `<Товар>` дерево групп и справочник свойств уже собраны — второй проход по
 * файлу не нужен.
 *
 * @param {{
 *   filePath: string;
 *   onGroups?: (groups: OneCGroup[]) => Promise<void> | void;
 *   onProducts: (products: OneCCatalogProduct[]) => Promise<void> | void;
 * }} params
 * @returns {Promise<{ groups: number; products: number; onlyChanges: boolean }>}
 */
export async function parseCommerceMlCatalog({
  filePath,
  onGroups,
  onProducts,
}) {
  /** @type {Map<string, { name: string; values: Map<string, string> }>} */
  const propertyDict = new Map();
  /** @type {OneCGroup[]} */
  const groups = [];
  let productCount = 0;
  let groupsFlushed = false;

  const flushGroups = async () => {
    if (groupsFlushed) return;
    groupsFlushed = true;
    if (onGroups) await onGroups(groups);
  };

  /** @type {OneCCatalogProduct[]} */
  let buffer = [];
  let onlyChanges = false;

  await streamXmlElements({
    filePath,
    capture: ["Группа", "Свойство", "Товар"],
    batchSize: ONEC_IMPORT_BATCH_SIZE,
    onOpenTag: (name, attrs) => {
      if (name !== "Каталог") return;
      onlyChanges = /^(true|истина|да|1)$/i.test(
        String(attrs.СодержитТолькоИзменения ?? "").trim(),
      );
    },
    onBatch: async (nodes) => {
      for (const node of nodes) {
        if (node.__name === "Группа") {
          flattenGroup(node, null, [], groups);
          continue;
        }

        if (node.__name === "Свойство") {
          const id = childText(node, "Ид");
          if (!id) continue;
          /** @type {Map<string, string>} */
          const values = new Map();
          for (const variants of childList(node, "ВариантыЗначений")) {
            for (const row of childList(variants, "Справочник")) {
              const valueId = childText(row, "ИдЗначения");
              const label = childText(row, "Значение");
              if (valueId && label) values.set(valueId, label);
            }
          }
          propertyDict.set(id, {
            name: clamp(childText(node, "Наименование"), 200),
            values,
          });
          continue;
        }

        if (node.__name !== "Товар") continue;
        await flushGroups();
        const product = toCatalogProduct(node, propertyDict);
        if (!product) continue;
        buffer.push(product);
        productCount += 1;
      }

      if (buffer.length >= ONEC_IMPORT_BATCH_SIZE) {
        const batch = buffer;
        buffer = [];
        await onProducts(batch);
      }
    },
  });

  await flushGroups();
  if (buffer.length > 0) {
    await onProducts(buffer);
  }

  return { groups: groups.length, products: productCount, onlyChanges };
}
