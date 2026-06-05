import { setAuthCookie, setRefreshCookie } from "./authCookie.js";
import { signAccessToken, signRefreshToken } from "./authTokens.js";

/**
 * @param {import('mongoose').Document} user
 * @param {import('express').Response} res
 */
export const sendUserWithToken = (user, res) => {
  const userId = user._id.toString();
  setAuthCookie(res, signAccessToken(userId));
  setRefreshCookie(res, signRefreshToken(userId));
  return res.status(200).json({ success: true, data: user });
};
