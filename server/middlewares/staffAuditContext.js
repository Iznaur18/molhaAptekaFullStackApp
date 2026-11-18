/**
 * Снимок маршрута в момент staff-гейта: к `res.finish` после AppError Express
 * может обнулить `req.baseUrl` / `req.params`, и аудит терял префикс (`/product`).
 *
 * @param {import('express').Request} req
 * @param {string} role
 */
export function attachStaffAuditContext(req, role) {
  const routePath = req.route?.path ?? req.path ?? "";
  const baseUrl = req.baseUrl ?? "";
  req.staffAudit = {
    role,
    actionPath: `${baseUrl}${routePath}`,
    params: { ...(req.params ?? {}) },
  };
}
