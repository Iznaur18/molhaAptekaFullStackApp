import {
  getProductInstallmentProgram,
  upsertProductInstallmentProgram,
} from "../../services/product/productInstallment.js";
import { successRes } from "../../services/http/index.js";

/** `GET /product/:productId/installment-program` */
export const getProductInstallmentProgramController = async (req, res) => {
  const result = await getProductInstallmentProgram({
    productId: req.params.productId,
    userId: req.userId,
  });

  return successRes(res, result);
};

/** `PUT /product/:productId/installment-program` */
export const upsertProductInstallmentProgramController = async (req, res) => {
  const result = await upsertProductInstallmentProgram({
    userId: req.userId,
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, result);
};
