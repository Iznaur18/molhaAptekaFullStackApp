/**
 * Строки адреса для поиска в OpenStreetMap.
 *
 * DaData пишет адрес сокращениями ФИАС: «г Грозный, р-н Ахматовский, ул Мира,
 * д 19». Nominatim и Photon ищут по названиям из OSM — «Грозный, улица Мира,
 * 19» — и на сокращениях теряют дом, а то и улицу.
 */

/** @type {Array<[RegExp, string]>} */
const OSM_ADDRESS_REPLACEMENTS = [
  // Квартира OSM неизвестна, а район города дублирует город и часто
  // называется в OSM иначе — оба сегмента только сбивают поиск.
  [/(^|,)\s*кв\.?\s*\d[^,]*/giu, "$1"],
  [/(^|,)\s*р-н\s+[^,]*/giu, "$1"],
  [/(^|[\s,])р-н(?=[\s,]|$)/giu, "$1район"],
  [/(^|[\s,])обл\.?(?=[\s,]|$)/giu, "$1область"],
  [/(^|[\s,])респ\.?(?=[\s,]|$)/giu, "$1Республика"],
  [/(^|[\s,])ул\.?\s+/giu, "$1улица "],
  [/(^|[\s,])пр-кт\s+/giu, "$1проспект "],
  [/(^|[\s,])пер\.?\s+/giu, "$1переулок "],
  [/(^|[\s,])б-р\s+/giu, "$1бульвар "],
  [/(^|[\s,])ш\.?\s+/giu, "$1шоссе "],
  [/(^|[\s,])пл\.?\s+/giu, "$1площадь "],
  [/(^|[\s,])наб\.?\s+/giu, "$1набережная "],
  [/(^|[\s,])мкр\.?\s+/giu, "$1микрорайон "],
  [/(^|[\s,])корп\.?\s*/giu, "$1к"],
  [/(^|[\s,])стр\.?\s*/giu, "$1с"],
  // Типы населённых пунктов и «д»/«уч» перед номером: в OSM их нет.
  [/(^|[\s,])(?:г|с|п|пос|пгт|рп|ст-ца|х|аул|дер)\.?\s+/giu, "$1"],
  [/(^|[\s,])(?:д|дом|уч|влд)\.?\s+/giu, "$1"],
];

/**
 * @param {string | null | undefined} line
 */
export function cleanAddressForOsm(line) {
  let text = String(line ?? "");
  for (const [pattern, replacement] of OSM_ADDRESS_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text
    .split(",")
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Номер дома из строки DaData: сегмент «д 19», «д 7 к 1», «уч 51».
 *
 * @param {string | null | undefined} line
 */
export function extractHouseNumber(line) {
  for (const part of String(line ?? "").split(",")) {
    const match = part.trim().match(/^(?:д|дом|уч|влд)\.?\s*(\S.*)$/iu);
    if (match) {
      return match[1].trim();
    }
  }
  return "";
}

/**
 * @param {unknown} value
 */
function normalizeHouseNumber(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ё/gu, "е")
    .replace(/\s+/gu, "")
    .replace(/^(?:д|дом)\.?/u, "")
    .replace(/корпус|корп\.?/gu, "к")
    .replace(/строение|стр\.?/gu, "с");
}

/**
 * Тот ли это дом.
 *
 * Photon ищет нечётко и на «Мира 19» охотно отдаёт «Мира 71/19» — дом на той
 * же улице, но в другом её конце. Такой ответ годится только как улица.
 *
 * @param {unknown} requested
 * @param {unknown} found
 */
export function houseNumbersMatch(requested, found) {
  const left = normalizeHouseNumber(requested);
  return left !== "" && left === normalizeHouseNumber(found);
}

/**
 * Запросы от точного к грубому: без дома, без улицы, только город.
 *
 * «г Грозный, ул Мира, д 19» → «г Грозный, ул Мира», «г Грозный».
 *
 * @param {string | null | undefined} line
 * @returns {string[]}
 */
export function buildCoarseAddressQueries(line) {
  const segments = String(line ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  /** @type {string[]} */
  const queries = [];
  for (let size = segments.length - 1; size >= 1; size -= 1) {
    queries.push(segments.slice(0, size).join(", "));
  }
  return queries;
}
