import jwt from "jsonwebtoken";

export const TOKEN_TYPE_ACCESS = "access";
export const TOKEN_TYPE_REFRESH = "refresh";

const JWT_VERIFY_OPTIONS = { algorithms: ["HS256"] };

/**
 * @returns {string}
 */
export function resolveJwtAccessSecret() {
  const secret =
    process.env.JWT_ACCESS_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET / JWT_SECRET не задан");
  }
  return secret;
}

/**
 * @returns {string}
 */
export function resolveJwtRefreshSecret() {
  const secret =
    process.env.JWT_REFRESH_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET / JWT_SECRET не задан");
  }
  return secret;
}

/**
 * `tv` обязателен: без него logout/ротация не отзывали бы access-токен —
 * bump версии гасил только refresh, а access жил ещё до часа.
 */
export const signAccessToken = (userId, authTokenVersion = 0) =>
  jwt.sign(
    { _id: userId, typ: TOKEN_TYPE_ACCESS, tv: authTokenVersion },
    resolveJwtAccessSecret(),
    {
      expiresIn: "1h",
      algorithm: "HS256",
    },
  );

export const signRefreshToken = (userId, authTokenVersion = 0) =>
  jwt.sign(
    { _id: userId, typ: TOKEN_TYPE_REFRESH, tv: authTokenVersion },
    resolveJwtRefreshSecret(),
    {
      expiresIn: "30d",
      algorithm: "HS256",
    },
  );

/**
 * Access JWT: typ=access или legacy без typ (до миграции v2).
 * @param {string} token
 */
export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, resolveJwtAccessSecret(), JWT_VERIFY_OPTIONS);
  if (decoded.typ && decoded.typ !== TOKEN_TYPE_ACCESS) {
    throw new Error("INVALID_TOKEN_TYPE");
  }
  return decoded;
};

/**
 * @param {string} token
 */
export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, resolveJwtRefreshSecret(), JWT_VERIFY_OPTIONS);
  if (decoded.typ !== TOKEN_TYPE_REFRESH) {
    throw new Error("INVALID_TOKEN_TYPE");
  }
  return decoded;
};
