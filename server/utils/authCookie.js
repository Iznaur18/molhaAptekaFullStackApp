import {
    AUTH_COOKIE_MAX_AGE_MS,
    AUTH_COOKIE_NAME,
} from '../constants/authCookieConstants.js';

const BEARER_PREFIX = 'Bearer ';

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * @returns {import('express').CookieOptions}
 */
export const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
});

/**
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

/**
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'lax',
        path: '/',
    });
};

/**
 * JWT из httpOnly cookie или Authorization: Bearer (Insomnia / legacy).
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
export const getAuthTokenFromRequest = (req) => {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    if (typeof cookieToken === 'string' && cookieToken.trim() !== '') {
        return cookieToken.trim();
    }

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith(BEARER_PREFIX)) {
        return authHeader.slice(BEARER_PREFIX.length).trim();
    }

    return '';
};
