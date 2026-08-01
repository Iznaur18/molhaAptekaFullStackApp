import {
  PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES,
  PRODUCT_COMPARE_NAME_STOP_WORDS,
  PRODUCT_COMPARE_NAME_TOKEN_MIN_LENGTH,
} from "../../constants/productCompareConstants.js";

/**
 * @param {unknown} name
 * @returns {string[]}
 */
export function tokenizeProductNameForCompare(name) {
  const raw = String(name ?? "")
    .toLowerCase()
    .normalize("NFC");
  const parts = raw.split(/[^\p{L}\p{N}]+/u);
  const tokens = [];
  const seen = new Set();

  for (const part of parts) {
    const token = part.trim();
    if (token.length < PRODUCT_COMPARE_NAME_TOKEN_MIN_LENGTH) continue;
    if (PRODUCT_COMPARE_NAME_STOP_WORDS.has(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
  }

  return tokens;
}

/**
 * @param {unknown} key
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeCharacteristicPairKey(key, value) {
  const k = String(key ?? "")
    .trim()
    .toLowerCase();
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!k || !v) return null;
  return `${k}::${v}`;
}

/**
 * @param {unknown} characteristics
 * @returns {Set<string>}
 */
export function buildCharacteristicPairSet(characteristics) {
  const set = new Set();
  if (!Array.isArray(characteristics)) return set;

  for (const row of characteristics) {
    if (row == null || typeof row !== "object") continue;
    const pair = normalizeCharacteristicPairKey(
      /** @type {{ key?: unknown; value?: unknown }} */ (row).key,
      /** @type {{ key?: unknown; value?: unknown }} */ (row).value,
    );
    if (pair) set.add(pair);
  }

  return set;
}

/**
 * @param {Set<string>} sourcePairs
 * @param {unknown} candidateCharacteristics
 * @returns {number}
 */
export function countMatchingCharacteristicPairs(
  sourcePairs,
  candidateCharacteristics,
) {
  if (!(sourcePairs instanceof Set) || sourcePairs.size === 0) return 0;

  const candidatePairs = buildCharacteristicPairSet(candidateCharacteristics);
  let count = 0;
  for (const pair of candidatePairs) {
    if (sourcePairs.has(pair)) count += 1;
  }
  return count;
}

/**
 * @param {string[]} sourceTokens
 * @param {unknown} candidateName
 * @returns {boolean}
 */
export function sharesProductNameToken(sourceTokens, candidateName) {
  if (!Array.isArray(sourceTokens) || sourceTokens.length === 0) return false;
  const candidateTokens = new Set(tokenizeProductNameForCompare(candidateName));
  return sourceTokens.some((token) => candidateTokens.has(token));
}

/**
 * @param {{
 *   sourceNameTokens: string[];
 *   sourceCharacteristicPairs: Set<string>;
 *   candidateName: unknown;
 *   candidateCharacteristics: unknown;
 *   minCharacteristicMatches?: number;
 * }} input
 * @returns {{ ok: boolean; characteristicMatches: number }}
 */
export function evaluateProductCompareMatch({
  sourceNameTokens,
  sourceCharacteristicPairs,
  candidateName,
  candidateCharacteristics,
  minCharacteristicMatches = PRODUCT_COMPARE_MIN_CHARACTERISTIC_MATCHES,
}) {
  if (
    !(sourceCharacteristicPairs instanceof Set) ||
    sourceCharacteristicPairs.size < minCharacteristicMatches
  ) {
    return { ok: false, characteristicMatches: 0 };
  }

  if (!sharesProductNameToken(sourceNameTokens, candidateName)) {
    return { ok: false, characteristicMatches: 0 };
  }

  const characteristicMatches = countMatchingCharacteristicPairs(
    sourceCharacteristicPairs,
    candidateCharacteristics,
  );

  return {
    ok: characteristicMatches >= minCharacteristicMatches,
    characteristicMatches,
  };
}
