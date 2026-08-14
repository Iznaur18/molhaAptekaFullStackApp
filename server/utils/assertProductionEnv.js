import {
  isObjectStorageUploadEnabled,
  validateObjectStorageEnv,
} from "./objectStorageUpload.js";
import {
  isPassportVaultEnabled,
  resolvePassportVaultKekHex,
} from "../services/passport-vault/passportVaultKey.js";
import { PASSPORT_VAULT_KEK_HEX_LENGTH } from "../constants/passportVaultConstants.js";

const PLACEHOLDER_JWT_SECRETS = new Set([
  "REPLACE_WITH_crypto_randomBytes_32_hex",
  "REPLACE_WITH_different_crypto_randomBytes_32_hex",
  "smoke-test-jwt-secret-min-32-chars-long",
  // Бывший пример из .env.production.example — нельзя деплоить как есть.
  "FORN_vrevr_vtoppVR*%@!!rvmv_c22F44_42~~@~!c2!vr0_cwvrevrVC334r~!",
]);

const MIN_JWT_SECRET_LENGTH = 32;

/**
 * @param {string | undefined} value
 */
const isBlank = (value) => !value || !String(value).trim();

/**
 * @param {string | undefined} mongoUri
 */
const mongoUriLooksLikeStandaloneDev = (mongoUri) => {
  const uri = String(mongoUri ?? "");
  if (!uri) {
    return false;
  }
  if (uri.includes("replicaSet=") || uri.startsWith("mongodb+srv://")) {
    return false;
  }
  return /^mongodb:\/\/(localhost|127\.0\.0\.1)/.test(uri);
};

/** Host из docker-compose / локального mongod — нельзя в production. */
const LOCAL_MONGO_HOST_RE =
  /^mongodb(\+srv)?:\/\/(?:[^/@]+@)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|\?|$)/i;

/**
 * @param {string | undefined} mongoUri
 */
const mongoUriLooksLikeLocalhost = (mongoUri) =>
  LOCAL_MONGO_HOST_RE.test(String(mongoUri ?? ""));

/** user:pass@host или user@host — иначе URI как у compose без auth. */
const mongoUriHasCredentials = (mongoUri) =>
  /^mongodb(\+srv)?:\/\/[^/@]+@/.test(String(mongoUri ?? ""));

/** replicaSet= в query — нужен для транзакций заказов/баллов. */
const mongoUriHasReplicaSet = (mongoUri) =>
  /[?&]replicaSet=/.test(String(mongoUri ?? ""));

/**
 * Same-VPS prod: mongodb://user:pass@127.0.0.1:27017/db?replicaSet=rs0&authSource=admin
 * Режем только «голый» localhost без auth (docker-compose из корня репо).
 * @param {string | undefined} mongoUri
 */
const mongoUriIsUnsafeLocalhostProd = (mongoUri) => {
  if (!mongoUriLooksLikeLocalhost(mongoUri)) {
    return false;
  }
  return !(mongoUriHasCredentials(mongoUri) && mongoUriHasReplicaSet(mongoUri));
};

/**
 * Проверка env перед production-деплоем.
 * @returns {{ ok: boolean; errors: string[]; warnings: string[] }}
 */
export const assertProductionEnv = () => {
  const errors = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === "production";

  if (isBlank(process.env.JWT_SECRET)) {
    errors.push("JWT_SECRET не задан");
  } else {
    const secret = String(process.env.JWT_SECRET);
    if (secret.length < MIN_JWT_SECRET_LENGTH) {
      errors.push(
        `JWT_SECRET слишком короткий (${secret.length} символов, нужно ≥ ${MIN_JWT_SECRET_LENGTH})`,
      );
    }
    if (PLACEHOLDER_JWT_SECRETS.has(secret)) {
      errors.push(
        "JWT_SECRET — placeholder из .env.example, замените на случайную строку",
      );
    }
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET?.trim();
  const refreshSecret = process.env.JWT_REFRESH_SECRET?.trim();
  if (accessSecret && accessSecret.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(
      `JWT_ACCESS_SECRET слишком короткий (нужно ≥ ${MIN_JWT_SECRET_LENGTH})`,
    );
  }
  if (refreshSecret && refreshSecret.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(
      `JWT_REFRESH_SECRET слишком короткий (нужно ≥ ${MIN_JWT_SECRET_LENGTH})`,
    );
  }
  if (isProduction && accessSecret && refreshSecret && accessSecret === refreshSecret) {
    errors.push("JWT_ACCESS_SECRET и JWT_REFRESH_SECRET не должны совпадать");
  }
  if (isProduction && (!accessSecret || !refreshSecret)) {
    errors.push(
      "Задайте JWT_ACCESS_SECRET и JWT_REFRESH_SECRET (отдельные секреты, не fallback на JWT_SECRET)",
    );
  }
  if (accessSecret && PLACEHOLDER_JWT_SECRETS.has(accessSecret)) {
    errors.push("JWT_ACCESS_SECRET — placeholder, замените на случайную строку");
  }
  if (refreshSecret && PLACEHOLDER_JWT_SECRETS.has(refreshSecret)) {
    errors.push("JWT_REFRESH_SECRET — placeholder, замените на случайную строку");
  }

  if (isBlank(process.env.MONGO_URI)) {
    errors.push("MONGO_URI не задан");
  } else if (mongoUriLooksLikeStandaloneDev(process.env.MONGO_URI)) {
    warnings.push(
      "MONGO_URI указывает на локальный standalone MongoDB — транзакции заказов/баллов требуют replica set (rs0 на VPS, см. docs/deploy/DEPLOY.md)",
    );
  }

  if (isProduction && !isBlank(process.env.MONGO_URI)) {
    if (mongoUriIsUnsafeLocalhostProd(process.env.MONGO_URI)) {
      errors.push(
        "MONGO_URI на localhost без auth+replicaSet — для prod на VPS: mongodb://USER:PASS@127.0.0.1:27017/torgum?replicaSet=rs0&authSource=admin (см. docs/deploy/DEPLOY.md); голый compose URI запрещён",
      );
    } else if (!mongoUriHasCredentials(process.env.MONGO_URI)) {
      errors.push(
        "MONGO_URI без credentials (user:password@) — в production обязателен auth (свой mongod на VPS или managed DB)",
      );
    } else if (
      !String(process.env.MONGO_URI).startsWith("mongodb+srv://") &&
      !mongoUriHasReplicaSet(process.env.MONGO_URI)
    ) {
      errors.push(
        "MONGO_URI без replicaSet= — транзакции заказов/баллов требуют rs0 (см. docs/deploy/DEPLOY.md)",
      );
    }

    if (
      mongoUriLooksLikeLocalhost(process.env.MONGO_URI) &&
      mongoUriHasCredentials(process.env.MONGO_URI) &&
      mongoUriHasReplicaSet(process.env.MONGO_URI)
    ) {
      warnings.push(
        "MONGO_URI на 127.0.0.1 (same-VPS) — ок для старта; бэкапы mongodump и bindIp только localhost (DEPLOY.md §1, §9)",
      );
    }
  }

  if (isProduction) {
    if (isBlank(process.env.FRONTEND_URL)) {
      errors.push(
        "FRONTEND_URL обязателен при NODE_ENV=production (CORS + verify email)",
      );
    } else {
      const frontendUrl = String(process.env.FRONTEND_URL).trim();
      if (!frontendUrl.startsWith("https://")) {
        warnings.push(
          "FRONTEND_URL без https:// — Secure cookie и cross-site auth могут не работать в браузере",
        );
      }
    }

    if (isBlank(process.env.PUBLIC_UPLOAD_BASE_URL)) {
      warnings.push(
        "PUBLIC_UPLOAD_BASE_URL не задан — URL загрузок в БД могут быть относительными; для варианта A задайте https://ваш-домен",
      );
    }

    const crossSite =
      String(process.env.COOKIE_CROSS_SITE ?? "").toLowerCase() === "true";
    if (crossSite && isBlank(process.env.FRONTEND_URL)) {
      errors.push("COOKIE_CROSS_SITE=true требует FRONTEND_URL");
    }
  }

  const smtpPartial =
    Boolean(process.env.SMTP_HOST) ||
    Boolean(process.env.SMTP_USER) ||
    Boolean(process.env.SMTP_PASS);
  const smtpComplete =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS);

  if (smtpPartial && !smtpComplete) {
    warnings.push(
      "SMTP задан частично — нужны SMTP_HOST, SMTP_USER, SMTP_PASS (и SMTP_FROM)",
    );
  }
  if (isProduction && !smtpComplete) {
    errors.push(
      "SMTP обязателен при NODE_ENV=production (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    );
  }

  const objectStorage = validateObjectStorageEnv();
  errors.push(...objectStorage.errors);
  warnings.push(...objectStorage.warnings);

  if (isProduction && !isObjectStorageUploadEnabled()) {
    warnings.push(
      "UPLOAD_STORAGE не s3 — медиа на диске VPS; для масштаба задайте UPLOAD_STORAGE=s3 и CDN (PUBLIC_UPLOAD_BASE_URL)",
    );
  }

  const vaultKek = resolvePassportVaultKekHex();
  if (isProduction) {
    if (!vaultKek) {
      errors.push(
        "PASSPORT_VAULT_KEK обязателен при NODE_ENV=production (64 hex = 32 байта AES key)",
      );
    } else if (vaultKek.length !== PASSPORT_VAULT_KEK_HEX_LENGTH) {
      errors.push(
        `PASSPORT_VAULT_KEK должен быть ${PASSPORT_VAULT_KEK_HEX_LENGTH} hex-символов`,
      );
    } else if (!isPassportVaultEnabled()) {
      errors.push("PASSPORT_VAULT_KEK невалиден (ожидается hex)");
    }
  } else if (!vaultKek) {
    warnings.push(
      "PASSPORT_VAULT_KEK не задан — паспортные ПДн пишутся plaintext (только для local/dev)",
    );
  }

  const redisUrl = process.env.REDIS_URL?.trim();
  if (isProduction && redisUrl && !redisUrl.startsWith("rediss://")) {
    warnings.push(
      "REDIS_URL без rediss:// — в production предпочтителен TLS (Upstash/ElastiCache TLS)",
    );
  }

  if (isProduction && isBlank(process.env.SENTRY_DSN)) {
    warnings.push(
      "SENTRY_DSN не задан — ошибки prod не попадут в Sentry (фаза 0: server/docs/SENTRY.md)",
    );
  }

  if (isProduction) {
    warnings.push(
      "Фаза 0: убедитесь что бэкап Mongo включён (Atlas Continuous Backup или mongodump cron) — server/docs/RUNBOOK.md",
    );
  }

  return { ok: errors.length === 0, errors, warnings };
};
