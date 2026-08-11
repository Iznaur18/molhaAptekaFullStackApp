/**
 * Access-log sample rate 0..1.
 * - unset: production → 0.1, test → 0, else → 1
 * - `0` / invalid → off
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {number}
 */
export function resolveAccessLogSampleRate(env = process.env) {
  const raw = env.ACCESS_LOG_SAMPLE_RATE;
  if (raw == null || String(raw).trim() === "") {
    if (env.NODE_ENV === "production") {
      return 0.1;
    }
    if (env.NODE_ENV === "test") {
      return 0;
    }
    return 1;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function shouldSkipAccessLogPath(path) {
  const normalized = String(path ?? "");
  if (normalized === "/health") {
    return true;
  }
  if (normalized === "/uploads" || normalized.startsWith("/uploads/")) {
    return true;
  }
  return false;
}

/**
 * @param {number} sampleRate
 * @param {() => number} [random]
 * @returns {boolean}
 */
export function shouldSampleAccessLog(sampleRate, random = Math.random) {
  if (sampleRate >= 1) {
    return true;
  }
  if (sampleRate <= 0) {
    return false;
  }
  return random() < sampleRate;
}
