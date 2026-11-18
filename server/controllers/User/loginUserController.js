import { authenticateEmailPasswordLogin } from "../../services/auth/loginEmailPassword.js";
import { sendUserWithToken } from "../../services/auth/sendUserWithToken.js";
import { securityRequestFields } from "../../services/auth/logSecurityEvent.js";

/** Вход по email + пароль. POST /auth/login */
export const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateEmailPasswordLogin({
    email,
    password,
    securityFields: securityRequestFields(req),
  });
  return sendUserWithToken(user, res, req);
};
