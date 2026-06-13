import { issueAuthSession } from "./issueAuthSession.js";

/**
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 */
export const sendUserWithToken = (user, res) => {
  const data = issueAuthSession(user, res);
  return res.status(200).json({ success: true, data });
};
