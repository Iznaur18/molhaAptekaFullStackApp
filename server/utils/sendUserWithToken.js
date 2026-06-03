import jwt from 'jsonwebtoken';
import { successRes } from './successRes.js';
import { setAuthCookie } from './authCookie.js';

const TOKEN_OPTIONS = { expiresIn: '30d' };

/**
 * Ответ login/register: user в JSON, JWT в httpOnly cookie.
 *
 * @param {object} user - документ пользователя (mongoose)
 * @param {object} res - объект response Express
 */
export function sendUserWithToken(user, res) {
    const { passwordHash, ...userData } = user._doc;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, TOKEN_OPTIONS);
    setAuthCookie(res, token);

    return successRes(res, userData);
}
