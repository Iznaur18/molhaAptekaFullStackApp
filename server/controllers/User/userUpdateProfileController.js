import { successRes } from "../../services/http/index.js";
import { updateProfile } from "../../services/user/updateProfile.js";

/** Обновление профиля. PATCH /user/:userId */
export const userUpdateProfileController = async (req, res) => {
  const data = await updateProfile({
    currentUserId: String(req.userId),
    targetUserId: String(req.params.userIdClient),
    body: req.body ?? {},
    verifiedDeliveryAddress: req.verifiedDeliveryAddress,
    verifiedUserAddresses: req.verifiedUserAddresses,
  });
  return successRes(res, data);
};
