import { issueAuthSession } from "./issueAuthSession.js";

/**
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 * @param {import('express').Request} [req]
 */
export const sendUserWithToken = (user, res, req) => {
  const data = issueAuthSession(user, res, req);
  return res.status(200).json({ success: true, data });
};
