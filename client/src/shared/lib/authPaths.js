/**
 * SPA auth routes (parity with mobile `/(auth)/*`).
 */

/**
 * @param {string} pathname
 */
function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

/**
 * @param {string} pathname
 */
export function isLoginPath(pathname) {
  return normalizePathname(pathname) === "/login";
}

/**
 * @param {string} pathname
 */
export function isRegisterPath(pathname) {
  return normalizePathname(pathname) === "/register";
}

/**
 * @param {string} pathname
 */
export function isForgotPasswordPath(pathname) {
  return normalizePathname(pathname) === "/forgot-password";
}

/**
 * @param {string} pathname
 */
export function isAuthPagePath(pathname) {
  return (
    isLoginPath(pathname) ||
    isRegisterPath(pathname) ||
    isForgotPasswordPath(pathname)
  );
}

export const AUTH_LOGIN_PATH = "/login";
export const AUTH_REGISTER_PATH = "/register";
export const AUTH_FORGOT_PASSWORD_PATH = "/forgot-password";
