/**
 * @param {unknown} value
 */
const hasNonEmptyImageUrl = (value) =>
  typeof value === "string" && value.trim().length > 0;

/**
 * @param {{ productImageUrls?: unknown; productImageUrl?: unknown }} product
 */
export const productHasImages = (product) => {
  const urls = Array.isArray(product.productImageUrls) ? product.productImageUrls : [];
  if (urls.some(hasNonEmptyImageUrl)) {
    return true;
  }
  return hasNonEmptyImageUrl(product.productImageUrl);
};

/** Mongo-фильтр: нет ни одного непустого URL в productImageUrls и нет legacy productImageUrl. */
export const productsWithoutImagesFilter = {
  $expr: {
    $and: [
      {
        $eq: [
          {
            $size: {
              $filter: {
                input: { $ifNull: ["$productImageUrls", []] },
                as: "url",
                cond: {
                  $gt: [
                    {
                      $strLenCP: {
                        $trim: {
                          input: {
                            $cond: [
                              { $eq: [{ $type: "$$url" }, "string"] },
                              "$$url",
                              "",
                            ],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
          0,
        ],
      },
      {
        $lte: [
          {
            $strLenCP: {
              $trim: {
                input: {
                  $cond: [
                    { $eq: [{ $type: "$productImageUrl" }, "string"] },
                    "$productImageUrl",
                    "",
                  ],
                },
              },
            },
          },
          0,
        ],
      },
    ],
  },
};
