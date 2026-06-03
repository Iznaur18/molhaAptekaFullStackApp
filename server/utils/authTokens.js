import jwt from 'jsonwebtoken';

export const TOKEN_TYPE_ACCESS = 'access';
export const TOKEN_TYPE_REFRESH = 'refresh';

export const signAccessToken = (userId) =>
    jwt.sign({ _id: userId, typ: TOKEN_TYPE_ACCESS }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

export const signRefreshToken = (userId) =>
    jwt.sign({ _id: userId, typ: TOKEN_TYPE_REFRESH }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

/**
 * Access JWT: typ=access или legacy без typ (до миграции v2).
 * @param {string} token
 */
export const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.typ && decoded.typ !== TOKEN_TYPE_ACCESS) {
        throw new Error('INVALID_TOKEN_TYPE');
    }
    return decoded;
};

/**
 * @param {string} token
 */
export const verifyRefreshToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.typ !== TOKEN_TYPE_REFRESH) {
        throw new Error('INVALID_TOKEN_TYPE');
    }
    return decoded;
};
