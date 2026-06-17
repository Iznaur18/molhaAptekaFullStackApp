import { PRODUCT_CATEGORY_LABEL_LOOKUP } from "../../constants/productCategoryLabels.js";
import { PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH } from "../../constants/productSearchSynonyms.js";
import { escapeRegexSpecialCharsInUserInput } from "../../utils/buildRegexSearchOr.js";
import {
  normalizeProductSearchText,
  tokenizeProductSearchTerm,
} from "./normalizeProductSearchText.js";
import { getProductSearchSynonymTokensMap } from "./productSearchSynonymCache.js";

/**
 * @param {string} token
 * @param {Record<string, { categories: string[] }>} tokensMap
 * @returns {string[]}
 */
const categoriesForSynonymToken = (token, tokensMap) => {
  const entry = tokensMap[token];
  if (!entry?.categories?.length) return [];
  return entry.categories;
};

/**
 * @param {string} token
 * @param {Record<string, { categories: string[] }>} tokensMap
 * @returns {string[]}
 */
const categoriesForShortTokenPrefix = (token, tokensMap) => {
  if (token.length > 4) return [];
  const matches = Object.keys(tokensMap).filter((key) => key.startsWith(token));
  if (matches.length !== 1) return [];
  return categoriesForSynonymToken(matches[0], tokensMap);
};

/**
 * @param {string} normalizedTerm
 * @returns {string[]}
 */
const categoriesFromFullTermLabelOrSlug = (normalizedTerm) => {
  const slug = PRODUCT_CATEGORY_LABEL_LOOKUP.get(normalizedTerm);
  return slug ? [slug] : [];
};

/**
 * @param {unknown} rawSearch
 * @returns {Promise<{
 *   hasTextSearch: boolean;
 *   normalizedTerm: string;
 *   escapedRegexPattern: string;
 *   categorySlugs: string[];
 *   regexCondition: { $regex: string; $options: string };
 * }>}
 */
export const resolveProductSearchIntent = async (rawSearch) => {
  const normalizedTerm = normalizeProductSearchText(rawSearch);
  const emptyIntent = {
    hasTextSearch: false,
    normalizedTerm: "",
    escapedRegexPattern: "",
    categorySlugs: [],
    regexCondition: { $regex: "", $options: "i" },
  };

  if (!normalizedTerm) return emptyIntent;

  const tokensMap = await getProductSearchSynonymTokensMap();
  const categorySet = new Set(categoriesFromFullTermLabelOrSlug(normalizedTerm));

  for (const token of tokenizeProductSearchTerm(normalizedTerm)) {
    if (token.length < PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH) {
      continue;
    }
    for (const slug of categoriesForSynonymToken(token, tokensMap)) {
      categorySet.add(slug);
    }
    for (const slug of categoriesForShortTokenPrefix(token, tokensMap)) {
      categorySet.add(slug);
    }
  }

  const escapedRegexPattern = escapeRegexSpecialCharsInUserInput(normalizedTerm);

  return {
    hasTextSearch: true,
    normalizedTerm,
    escapedRegexPattern,
    categorySlugs: [...categorySet],
    regexCondition: { $regex: escapedRegexPattern, $options: "i" },
  };
};
