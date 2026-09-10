import { EMAIL_AUTH_DISABLED_MESSAGE, isEmailAuthEnabled } from "@izibuy/shared-lib";

import { errorRes } from "../services/http/index.js";

function rejectEmailAuth(res) {
  return errorRes(res, 503, EMAIL_AUTH_DISABLED_MESSAGE);
}

/** Блокирует email-only роуты: POST /auth/login, POST /auth/register. */
export const rejectEmailOnlyAuthIfDisabledMW = (req, res, next) => {
  if (isEmailAuthEnabled()) {
    return next();
  }
  return rejectEmailAuth(res);
};

/** Блокирует reset/confirm, если в body передан email. */
export const rejectEmailContactAuthIfDisabledMW = (req, res, next) => {
  if (isEmailAuthEnabled()) {
    return next();
  }
  if (req.body?.email) {
    return rejectEmailAuth(res);
  }
  return next();
};
