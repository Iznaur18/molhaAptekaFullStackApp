import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** @type {string | null | undefined} */
let cachedGitCommitSha;

/**
 * Короткий SHA: env (CI/deploy) или `git rev-parse` в dev.
 *
 * @returns {string | null}
 */
export function resolveGitCommitSha() {
  if (cachedGitCommitSha !== undefined) {
    return cachedGitCommitSha;
  }

  const fromEnv =
    process.env.GIT_COMMIT_SHA?.trim() ||
    process.env.GITHUB_SHA?.trim()?.slice(0, 12) ||
    null;

  if (fromEnv) {
    cachedGitCommitSha = fromEnv;
    return cachedGitCommitSha;
  }

  try {
    const gitDir = path.join(SERVER_ROOT, ".git");
    if (!fs.existsSync(gitDir)) {
      cachedGitCommitSha = null;
      return null;
    }
    cachedGitCommitSha = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      cwd: SERVER_ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return cachedGitCommitSha || null;
  } catch {
    cachedGitCommitSha = null;
    return null;
  }
}
