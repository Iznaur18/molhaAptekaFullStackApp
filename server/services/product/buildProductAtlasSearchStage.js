import mongoose from "mongoose";

import {
  PRODUCT_ATLAS_SEARCH_INDEX_NAME,
  PRODUCT_ATLAS_SEARCH_NAME_BOOST,
} from "../../constants/productAtlasSearchConstants.js";

const { ObjectId } = mongoose.Types;

/**
 * @param {{
 *   normalizedTerm: string;
 *   categorySlugs?: string[];
 *   categoryNodeIds?: string[];
 * }} atlasSearch
 */
export const buildProductAtlasSearchCompound = ({
  normalizedTerm,
  categorySlugs = [],
  categoryNodeIds = [],
}) => {
  /** @type {Record<string, unknown>[]} */
  const should = [
    {
      text: {
        query: normalizedTerm,
        path: "productName",
        score: { boost: { value: PRODUCT_ATLAS_SEARCH_NAME_BOOST } },
      },
    },
    {
      text: {
        query: normalizedTerm,
        path: "productSearchBlob",
      },
    },
  ];

  if (categorySlugs.length > 0) {
    should.push({
      in: {
        path: "productCategory",
        value: categorySlugs,
      },
    });
  }

  if (categoryNodeIds.length > 0) {
    should.push({
      in: {
        path: "productCategoryId",
        value: categoryNodeIds
          .filter((id) => ObjectId.isValid(id))
          .map((id) => new ObjectId(id)),
      },
    });
  }

  return {
    should,
    minimumShouldMatch: 1,
  };
};

/**
 * @param {{
 *   normalizedTerm: string;
 *   categorySlugs?: string[];
 *   categoryNodeIds?: string[];
 * }} atlasSearch
 */
export const buildProductAtlasSearchStage = (atlasSearch) => ({
  $search: {
    index: PRODUCT_ATLAS_SEARCH_INDEX_NAME,
    compound: buildProductAtlasSearchCompound(atlasSearch),
  },
});
