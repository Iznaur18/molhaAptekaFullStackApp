import { postProduct } from "../../services/product/postProduct.js";
import { successRes } from "../../services/http/index.js";

export const postProductController = async (req, res) => {
  const result = await postProduct({
    userId: req.userId,
    body: req.body,
  });

  return successRes(res, result, 201);
};
