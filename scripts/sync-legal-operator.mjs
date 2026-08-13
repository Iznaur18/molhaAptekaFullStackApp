import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "legal/operator.config.json");
const PRIVACY_HTML_PATH = path.join(ROOT, "client/public/privacy.html");
const MOBILE_PRIVACY_TS_PATH = path.join(
  ROOT,
  "mobile/features/legal/model/privacyPolicyContent.ts",
);

const loadConfig = async () => {
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
};

const syncPrivacyHtml = async (config) => {
  let html = await fs.readFile(PRIVACY_HTML_PATH, "utf8");

  html = html.replace(
    /<p class="meta">Обновлено: [^<]*<\/p>/,
    `<p class="meta">Обновлено: ${config.updatedAt}</p>`,
  );
  html = html.replace(
    /<p class="operator">[^<]*<\/p>/,
    `<p class="operator">Оператор: ${config.operatorName}.</p>`,
  );
  html = html.replace(
    /<a href="mailto:[^"]+">[^<]+<\/a>/,
    `<a href="mailto:${config.contactEmail}">${config.contactEmail}</a>`,
  );

  await fs.writeFile(PRIVACY_HTML_PATH, html, "utf8");
};

const syncMobilePrivacyTs = async (config) => {
  let ts = await fs.readFile(MOBILE_PRIVACY_TS_PATH, "utf8");

  ts = ts.replace(
    /export const PRIVACY_POLICY_UPDATED_AT = "[^"]*";/,
    `export const PRIVACY_POLICY_UPDATED_AT = "${config.updatedAt}";`,
  );
  ts = ts.replace(
    /export const PRIVACY_POLICY_OPERATOR_PLACEHOLDER =[\s\S]*?";/,
    `export const PRIVACY_POLICY_OPERATOR_PLACEHOLDER =\n  "${config.operatorName}";`,
  );
  ts = ts.replace(
    /export const PRIVACY_POLICY_CONTACT_EMAIL = "[^"]*";/,
    `export const PRIVACY_POLICY_CONTACT_EMAIL = "${config.contactEmail}";`,
  );

  await fs.writeFile(MOBILE_PRIVACY_TS_PATH, ts, "utf8");
};

const syncStoreListings = async (config) => {
  const privacyUrl = `${config.siteUrl.replace(/\/$/, "")}${config.privacyPath}`;
  const listingDir = path.join(ROOT, "mobile/store-assets/listing");

  for (const fileName of ["google-play-ru.txt", "app-store-ru.txt"]) {
    const filePath = path.join(listingDir, fileName);
    let text = await fs.readFile(filePath, "utf8");
    text = text.replaceAll("https://ВАШ-ДОМЕН", config.siteUrl.replace(/\/$/, ""));
    text = text.replaceAll("support@izibuy.ru", config.contactEmail);
    text = text.replaceAll("iznaur.guzhaev@mail.ru", config.contactEmail);
    await fs.writeFile(filePath, text, "utf8");
  }

  console.log("Store listings privacy URL:", privacyUrl);
};

try {
  const config = await loadConfig();
  await syncPrivacyHtml(config);
  await syncMobilePrivacyTs(config);
  await syncStoreListings(config);
  console.log("Legal operator synced:", config.operatorName, config.contactEmail);
} catch (error) {
  console.error(error);
  process.exit(1);
}
