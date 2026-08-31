import {
  getMyCourierProfile,
  listCourierApplications,
  reviewCourierApplication,
  submitCourierApplication,
} from "../../services/courier/courierApplication.js";
import { successRes } from "../../services/http/index.js";

/** `GET /courier/me` — статус собственной заявки курьера. */
export const getMyCourierProfileController = async (req, res) => {
  const profile = await getMyCourierProfile(String(req.userId));
  return successRes(res, { courier: profile });
};

/** `POST /courier/application` — подать или переподать заявку. */
export const submitCourierApplicationController = async (req, res) => {
  const profile = await submitCourierApplication({
    userId: String(req.userId),
    vehicleMake: req.body.vehicleMake,
    vehicleColor: req.body.vehicleColor,
    vehiclePlate: req.body.vehiclePlate,
  });
  return successRes(res, { courier: profile });
};

/** `GET /staff/couriers` — очередь модерации. */
export const getStaffCourierApplicationsController = async (req, res) => {
  const result = await listCourierApplications({
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successRes(res, result);
};

/** `PATCH /staff/couriers/:userId/moderation` — решение модератора. */
export const patchStaffCourierModerationController = async (req, res) => {
  const profile = await reviewCourierApplication({
    userId: req.params.userId,
    moderatorId: String(req.userId),
    nextStatus: req.body.nextStatus,
    comment: req.body.comment,
  });
  return successRes(res, { courier: profile });
};
