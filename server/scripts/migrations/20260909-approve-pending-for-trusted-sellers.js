import { UserModel } from "../../models/index.js";
import { approvePendingProductsForTrustedSeller } from "../../services/product/approvePendingProductsForTrustedSeller.js";

/**
 * Дочищает очередь модерации у продавцов, которым доверие уже выдали
 * до bulk-approve на grant (например narodniyoptovik).
 *
 * Тот же код, что вызывается при выдаче тумблера.
 */
export const up = async () => {
  const sellers = await UserModel.find({ productModerationTrusted: true })
    .select("_id")
    .lean();

  let sellersProcessed = 0;
  let productsApproved = 0;

  for (const seller of sellers) {
    const { approved } = await approvePendingProductsForTrustedSeller({
      sellerId: seller._id,
    });
    sellersProcessed += 1;
    productsApproved += approved;
  }

  return { sellersProcessed, productsApproved };
};
