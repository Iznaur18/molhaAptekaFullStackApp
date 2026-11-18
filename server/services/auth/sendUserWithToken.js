import { successRes } from "../http/index.js";
import { issueAuthSession } from "./issueAuthSession.js";

/**
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 * @param {import('express').Request} [req]
 */
export const sendUserWithToken = (user, res, req) => {
  const data = issueAuthSession(user, res, req);
  return successRes(res, data);
};
