import { PRODUCT_SEARCH_SYNONYM_TOKENS_SEED } from "../../constants/productSearchSynonyms.js";
import ProductSearchSynonymModel from "../../models/ProductSearchSynonymModel.js";

export const up = async () => {
  for (const [token, entry] of Object.entries(PRODUCT_SEARCH_SYNONYM_TOKENS_SEED)) {
    const categories = Array.isArray(entry?.categories)
      ? entry.categories.filter(Boolean)
      : [];
    if (!token || !categories.length) continue;

    await ProductSearchSynonymModel.findOneAndUpdate(
      { token },
      { $set: { categories } },
      { upsert: true, runValidators: true },
    );
  }
};
