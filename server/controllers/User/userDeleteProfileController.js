import { successRes } from "../../services/http/index.js";
import { clearAuthCookie, clearRefreshCookie } from "../../utils/authCookie.js";
import { deleteProfile } from "../../services/user/deleteProfile.js";

/**
 * Удаление профиля: владельцем (самоудаление) либо админом — чужого.
 * Права, каскад и аудит-лог живут в services/user/deleteProfile.js.
 * DELETE /user/:userIdClient
 */
export const userDeleteProfileController = async (req, res) => {
  const currentUserId = req.userId;
  const targetUserId = req.params.userIdClient;

  const { isSelfDelete } = await deleteProfile({ currentUserId, targetUserId });

  // Самоудаление: своя сессия уже мертва — гасим cookie, как при логауте.
  if (isSelfDelete) {
    clearAuthCookie(res);
    clearRefreshCookie(res);
  }

  return successRes(res, { message: "Профиль успешно удален" });
};
