import { ProductModel, ProductViewModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";

const isDuplicateKeyError = (error) => error?.code === 11000;

/** `POST /product/:productId/view` — уникальный просмотр (Bearer, не продавец товара). */
export const recordProductViewController = async (req, res) => {
  try {
    const viewerUserId = String(req.userId);
    const { productId } = req.params;

    const product = await ProductModel.findById(productId)
      .select("productSeller uniqueViewerCount")
      .lean();

    if (!product) {
      return errorRes(res, 404, "Товар не найден");
    }

    const sellerId = String(product.productSeller ?? "");
    const currentCount = Number(product.uniqueViewerCount) || 0;

    if (sellerId === viewerUserId) {
      return successRes(res, {
        recorded: false,
        reason: "own_product",
        uniqueViewerCount: currentCount,
      });
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
      return successRes(res, {
        recorded: true,
        uniqueViewerCount: currentCount + 1,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const fresh = await ProductModel.findById(productId)
          .select("uniqueViewerCount")
          .lean();
        return successRes(res, {
          recorded: false,
          reason: "already_viewed",
          uniqueViewerCount: Number(fresh?.uniqueViewerCount) || 0,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("recordProductViewController error:", error);
    return errorRes(res, 500, "Ошибка при записи просмотра");
  }
};
