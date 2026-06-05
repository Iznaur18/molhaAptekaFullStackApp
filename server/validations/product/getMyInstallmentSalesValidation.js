import { query } from "express-validator";

import { INSTALLMENT_SALES_LIST_FILTERS } from "../../constants/installmentConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

/** Валидация query списков рассрочки (`/contracts/my`, `/contracts/sales`). */
export const getMyInstallmentContractsListValidation = [
  query("status")
    .optional()
    .isIn(INSTALLMENT_SALES_LIST_FILTERS)
    .withMessage(
      `status должен быть одним из: ${INSTALLMENT_SALES_LIST_FILTERS.join(", ")}`,
    ),
  handleValidationByExpressErrors,
];

/** @deprecated alias */
export const getMyInstallmentSalesValidation = getMyInstallmentContractsListValidation;
