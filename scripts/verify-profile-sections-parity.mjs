import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PROFILE_SECTION_IDS } from "@izibuy/shared-lib";

const WEB_VIEW_TO_MOBILE_SECTION_ALIAS = new Map([["staff-raffles", "raffles"]]);

const WEB_VIEWS_OUTSIDE_PROFILE_HUB = new Set([
  "catalog",
  "catalog-browser",
  "my-profile",
  "users",
  "notifications",
  "cart",
]);

const MOBILE_ONLY_PROFILE_SECTIONS = new Set(["overview", "create-raffle", "edit-profile"]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const homeMainViewsPath = path.resolve(
  scriptDir,
  "../client/src/shared/lib/homeMainViewPaths.js",
);
const homeMainViewsSource = await fs.readFile(homeMainViewsPath, "utf8");

const homeMainViewKeys = Array.from(
  homeMainViewsSource.matchAll(/^\s*(?:"([^"]+)"|([a-z][\w-]*)):\s*"\//gim),
  (match) => match[1] ?? match[2],
);

const webProfileSections = homeMainViewKeys
  .filter((view) => !WEB_VIEWS_OUTSIDE_PROFILE_HUB.has(view))
  .map((view) => WEB_VIEW_TO_MOBILE_SECTION_ALIAS.get(view) ?? view);

const webProfileSectionSet = new Set(webProfileSections);
const mobileProfileSectionSet = new Set(PROFILE_SECTION_IDS);

const unknownInWeb = webProfileSections.filter((sectionId) => !mobileProfileSectionSet.has(sectionId));

const missingInWeb = PROFILE_SECTION_IDS.filter(
  (sectionId) =>
    !webProfileSectionSet.has(sectionId) && !MOBILE_ONLY_PROFILE_SECTIONS.has(sectionId),
);

if (unknownInWeb.length > 0 || missingInWeb.length > 0) {
  if (unknownInWeb.length > 0) {
    console.error(
      `[profile-parity] Web views map to unknown mobile sections: ${unknownInWeb.join(", ")}`,
    );
  }
  if (missingInWeb.length > 0) {
    console.error(
      `[profile-parity] Sections missing in web main views: ${missingInWeb.join(", ")}`,
    );
  }
  process.exit(1);
}

console.log("[profile-parity] ok");
