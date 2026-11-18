import { AppError } from "../../errors/AppError.js";
import { ProductModel, ProductViewModel } from "../../models/index.js";
import { emitProductViewedEvent } from "../analytics-events/index.js";

const isDuplicateKeyError = (error) => error?.code === 11000;

/**
 * @param {{ productId: string; viewerUserId: string }} args
 */
export async function recordProductView({ productId, viewerUserId }) {
  const product = await ProductModel.findById(productId)
    .select("productSeller uniqueViewerCount")
    .lean();

  if (!product) {
    throw new AppError(404, "Товар не найден");
  }

  const sellerId = String(product.productSeller ?? "");
  const currentCount = Number(product.uniqueViewerCount) || 0;

  if (sellerId === viewerUserId) {
    return {
      recorded: false,
      reason: "own_product",
      uniqueViewerCount: currentCount,
    };
  }

  try {
    await ProductViewModel.create({
      productId,
      viewerUserId,
    });
    await ProductModel.updateOne(
      { _id: productId },
      { $inc: { uniqueViewerCount: 1 } },
    );
    void emitProductViewedEvent({
      productId: String(productId),
      viewerUserId,
      sellerUserId: sellerId || null,
    });
    return {
      recorded: true,
      uniqueViewerCount: currentCount + 1,
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const fresh = await ProductModel.findById(productId)
        .select("uniqueViewerCount")
        .lean();
      return {
        recorded: false,
        reason: "already_viewed",
        uniqueViewerCount: Number(fresh?.uniqueViewerCount) || 0,
      };
    }
    throw error;
  }
}
