import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(__dirname, "..");
const UTILS_DIR = path.join(SERVER_DIR, "utils");

const CLUSTERS = {
  "intro-ad": [
    "introAdCampaignHelpers.js",
    "validateIntroAdMediaUrls.js",
    "cleanupReplacedAppIntroMedia.js",
    "resolveAppIntroSettingsPayload.js",
  ],
  auth: [
    "authTokens.js",
    "issueAuthSession.js",
    "userAuthTokenVersion.js",
    "resolveLogoutUserId.js",
    "sendUserWithToken.js",
  ],
  loyalty: [
    "loyaltyPointsReserve.js",
    "loyaltyPointsSpend.js",
    "loyaltyPointsSeller.js",
  ],
  upload: [
    "buildUploadFilename.js",
    "resolveUploadContentType.js",
    "resolveUploadFileExtension.js",
    "objectStorageUpload.js",
    "uploadsDir.js",
    "buildPublicUploadUrl.js",
    "parseUploadFilenameFromMediaUrl.js",
    "deleteUploadFileByUrl.js",
    "finalizeUploadedFile.js",
    "prepareUploadedVideoFile.js",
    "transcodeUploadVideoToH264.js",
    "isStoredBackgroundImageUrl.js",
    "isAllowedUploadVideoFile.js",
  ],
};

const EXISTING_SERVICE_DIRS = ["user", "product", "order", "installment", "raffle"];

const fileToServiceDir = new Map();
for (const [cluster, files] of Object.entries(CLUSTERS)) {
  for (const file of files) {
    fileToServiceDir.set(file, cluster);
  }
}

const existingServiceFiles = new Map();
for (const dir of EXISTING_SERVICE_DIRS) {
  const abs = path.join(SERVER_DIR, "services", dir);
  if (!fs.existsSync(abs)) {
    continue;
  }
  for (const name of fs.readdirSync(abs)) {
    if (name.endsWith(".js") && name !== "index.js") {
      existingServiceFiles.set(name, dir);
    }
  }
}

const serviceRelImport = (fromCluster, fileName) => {
  const targetCluster = fileToServiceDir.get(fileName);
  if (targetCluster) {
    if (targetCluster === fromCluster) {
      return `./${fileName}`;
    }
    return `../${targetCluster}/${fileName}`;
  }

  const existingDir = existingServiceFiles.get(fileName);
  if (existingDir) {
    return `../${existingDir}/${fileName}`;
  }

  return `../../utils/${fileName}`;
};

const rewriteImports = (source, fromCluster) => {
  let next = source
    .replaceAll('from "../constants/', 'from "../../constants/')
    .replaceAll('from "../models/', 'from "../../models/')
    .replaceAll('from "../errors/', 'from "../../errors/')
    .replaceAll('from "../db/', 'from "../../db/')
    .replaceAll('from "../controllers/', 'from "../../controllers/');

  next = next.replace(/from "\.\/([^"]+\.js)"/g, (_match, relPath) => {
    return `from "${serviceRelImport(fromCluster, relPath)}"`;
  });

  return next;
};

let migratedCount = 0;

for (const [cluster, files] of Object.entries(CLUSTERS)) {
  const targetDir = path.join(SERVER_DIR, "services", cluster);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const fileName of files) {
    const fromPath = path.join(UTILS_DIR, fileName);
    const toPath = path.join(targetDir, fileName);
    const source = fs.readFileSync(fromPath, "utf8");
    fs.writeFileSync(toPath, rewriteImports(source, cluster), "utf8");

    const shim = `export * from "../services/${cluster}/${fileName}";\n`;
    fs.writeFileSync(path.join(UTILS_DIR, fileName), shim, "utf8");
    migratedCount += 1;
  }
}

const IMPORT_TARGETS = {};
for (const [cluster, files] of Object.entries(CLUSTERS)) {
  for (const file of files) {
    IMPORT_TARGETS[file] = `services/${cluster}/${file}`;
  }
}

const walkAndUpdateImports = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") {
        continue;
      }
      walkAndUpdateImports(abs);
      continue;
    }
    if (!entry.name.endsWith(".js") && !entry.name.endsWith(".mjs")) {
      continue;
    }
    if (entry.name === "migrateNextClustersUtils.mjs") {
      continue;
    }

    let source = fs.readFileSync(abs, "utf8");
    let changed = false;

    for (const [fileName, serviceRel] of Object.entries(IMPORT_TARGETS)) {
      const escaped = fileName.replaceAll(".", "\\.");
      const re = new RegExp(
        `from "(\\.\\./)+utils/${escaped}"`,
        "g",
      );
      const relFromFile = path
        .relative(path.dirname(abs), path.join(SERVER_DIR, serviceRel))
        .replaceAll("\\", "/");
      const normalized = relFromFile.startsWith(".")
        ? relFromFile
        : `./${relFromFile}`;

      if (re.test(source)) {
        source = source.replace(
          new RegExp(`from "(\\.\\./)+utils/${escaped}"`, "g"),
          `from "${normalized}"`,
        );
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(abs, source, "utf8");
    }
  }
};

walkAndUpdateImports(SERVER_DIR);

console.log(
  `Migrated ${migratedCount} utils → intro-ad/auth/loyalty/upload; imports updated`,
);
