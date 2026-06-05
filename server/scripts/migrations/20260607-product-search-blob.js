import { ProductModel } from "../../models/index.js";
import { buildProductSearchBlobFromFields } from "../../utils/buildProductSearchBlob.js";

export const up = async () => {
  const cursor = ProductModel.find({})
    .select(
      "productName productDescription productCharacteristics productCategory productSearchBlob",
    )
    .lean()
    .cursor();

  for await (const product of cursor) {
    const nextBlob = buildProductSearchBlobFromFields({
      productName: product.productName,
      productDescription: product.productDescription,
      productCharacteristics: product.productCharacteristics,
      productCategory: product.productCategory,
    });

    if (product.productSearchBlob === nextBlob) {
      continue;
    }

    await ProductModel.updateOne(
      { _id: product._id },
      { $set: { productSearchBlob: nextBlob } },
    );
  }
};
