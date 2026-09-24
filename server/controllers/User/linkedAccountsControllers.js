import { successRes } from "../../services/http/index.js";
import {
  listLinkedAccounts,
  logoutAllLinkedAccounts,
  removeLinkedAccount,
  stashActiveSession,
  switchToLinkedAccount,
} from "../../services/auth/linkedAccounts.js";
import {
  logSecurityEvent,
  securityRequestFields,
} from "../../services/auth/logSecurityEvent.js";

/** `GET /auth/accounts` — аккаунты этого браузера. */
export const listLinkedAccountsController = async (req, res) => {
  const data = await listLinkedAccounts(req);
  return successRes(res, data);
};

/** `POST /auth/accounts/stash` — отложить текущий аккаунт перед входом в ещё один. */
export const stashActiveSessionController = async (req, res) => {
  const data = await stashActiveSession(req, res);
  logSecurityEvent("info", "account_stash", {
    ...securityRequestFields(req),
    userId: data.stashedUserId,
  });
  return successRes(res, data);
};

/** `POST /auth/accounts/switch` — переключиться на сохранённый аккаунт. */
export const switchLinkedAccountController = async (req, res) => {
  const data = await switchToLinkedAccount(req, res, req.body.userId);
  logSecurityEvent("info", "account_switch", {
    ...securityRequestFields(req),
    userId: String(data._id),
  });
  return successRes(res, data);
};

/** `POST /auth/accounts/remove` — убрать аккаунт с устройства без выхода. */
export const removeLinkedAccountController = async (req, res) => {
  const data = removeLinkedAccount(req, res, req.body.userId);
  return successRes(res, data);
};

/** `POST /auth/accounts/logout-all` — выйти из всех аккаунтов браузера. */
export const logoutAllLinkedAccountsController = async (req, res) => {
  const data = await logoutAllLinkedAccounts(req, res);
  logSecurityEvent("info", "logout_all_accounts", {
    ...securityRequestFields(req),
    count: data.loggedOutCount,
  });
  return successRes(res, data);
};
