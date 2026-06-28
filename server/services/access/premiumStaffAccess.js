import { ADMIN_ROLE, isStaffRole } from "./adminUserGuard.js";

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params
 */

export function canStaffManageTargetPremium({ editorRole, targetRole }) { // Функция проверяет может ли модератор менять премиум администратора
  if (!isStaffRole(editorRole)) { // Если редактор не является модератором или администратором, то возвращаем false
    return false;
  }
  if (editorRole === ADMIN_ROLE) { // Если редактор является администратором, то возвращаем true
    return true;
  }
  return targetRole !== ADMIN_ROLE; // Если роль администратора не равна ADMIN_ROLE, то возвращаем true
}

/**
 * @param {{ editorRole?: string | null; targetRole?: string | null }} params - параметры для проверки может ли модератор менять премиум администратора
 */
export function assertStaffCanManageTargetPremium({ editorRole, targetRole }) { // Функция проверяет может ли модератор менять премиум администратора
  if (!canStaffManageTargetPremium({ editorRole, targetRole })) { // Если модератор не может менять премиум администратора, то выбрасываем ошибку
    throw new Error("MODERATOR_CANNOT_MANAGE_ADMIN_PREMIUM"); // Ошибка "MODERATOR_CANNOT_MANAGE_ADMIN_PREMIUM"
  }
}
