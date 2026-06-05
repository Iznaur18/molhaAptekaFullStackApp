import { backfillProductCategoryIds } from "../../utils/backfillProductCategoryIds.js";

export const up = async () => {
  await backfillProductCategoryIds();
};
