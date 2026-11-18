import { successRes } from "../../services/http/index.js";
import {
  countPendingProductReports,
  getMyProductReportStatus,
  listPendingProductReports,
  resolveProductReportsForProduct,
  submitProductReport,
} from "../../services/product/productReports.js";

/** `POST /product/:productId/report` */
export const submitProductReportController = async (req, res) => {
  const data = await submitProductReport({
    reporterId: String(req.userId),
    productId: String(req.params.productId),
    reportText: req.body?.reportText,
  });
  return successRes(res, data);
};

/** `GET /product/:productId/report/me` */
export const getMyProductReportStatusController = async (req, res) => {
  const data = await getMyProductReportStatus({
    reporterId: String(req.userId),
    productId: String(req.params.productId),
  });
  return successRes(res, data);
};

/** `GET /product/reports/pending` */
export const getPendingProductReportsController = async (_req, res) => {
  const data = await listPendingProductReports();
  return successRes(res, data);
};

/** `GET /product/reports/pending/count` */
export const getPendingProductReportsCountController = async (_req, res) => {
  const data = await countPendingProductReports();
  return successRes(res, data);
};

/** `PATCH /product/reports/product/:productId/resolve` */
export const resolveProductReportsForProductController = async (req, res) => {
  const data = await resolveProductReportsForProduct({
    productId: String(req.params.productId),
    staffUserId: String(req.userId),
    staffNote: req.body?.staffNote,
    resolution: req.body?.resolution,
  });
  return successRes(res, data);
};
