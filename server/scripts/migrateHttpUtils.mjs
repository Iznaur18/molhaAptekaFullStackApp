import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(__dirname, "..");
const UTILS_DIR = path.join(SERVER_DIR, "utils");
const HTTP_DIR = path.join(SERVER_DIR, "services", "http");

const HTTP_FILES = ["successRes.js", "errorRes.js"];

fs.mkdirSync(HTTP_DIR, { recursive: true });

for (const fileName of HTTP_FILES) {
  const source = fs.readFileSync(path.join(UTILS_DIR, fileName), "utf8");
  fs.writeFileSync(path.join(HTTP_DIR, fileName), source, "utf8");
  fs.writeFileSync(
    path.join(UTILS_DIR, fileName),
    `export * from "../services/http/${fileName}";\n`,
    "utf8",
  );
}

fs.writeFileSync(
  path.join(HTTP_DIR, "index.js"),
  `export { successRes } from "./successRes.js";
export { errorRes } from "./errorRes.js";
`,
  "utf8",
);

fs.writeFileSync(
  path.join(UTILS_DIR, "index.js"),
  `export { successRes, errorRes } from "../services/http/index.js";
export { sendUserWithToken } from "./sendUserWithToken.js";
export { buildRegexSearchOr } from "./buildRegexSearchOr.js";
`,
  "utf8",
);

const HTTP_IMPORT_RE =
  /import\s*\{([^}]+)\}\s*from\s*"(?:\.\.\/)+utils\/index\.js";/g;

const splitSpecifiers = (raw) =>
  raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const relImport = (fromFile, targetPath) => {
  const rel = path
    .relative(path.dirname(fromFile), path.join(SERVER_DIR, targetPath))
    .replaceAll("\\", "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

const formatImport = (specifiers, fromPath) =>
  `import { ${specifiers.join(", ")} } from "${fromPath}";`;

const walkAndRewriteImports = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") {
        continue;
      }
      walkAndRewriteImports(abs);
      continue;
    }
    if (!entry.name.endsWith(".js")) {
      continue;
    }

    const source = fs.readFileSync(abs, "utf8");
    let changed = false;

    const next = source.replace(HTTP_IMPORT_RE, (_match, specifiersRaw) => {
      const specifiers = splitSpecifiers(specifiersRaw);
      const httpSpecs = specifiers.filter((name) =>
        ["successRes", "errorRes"].includes(name),
      );
      const authSpecs = specifiers.filter((name) => name === "sendUserWithToken");
      const utilSpecs = specifiers.filter((name) => name === "buildRegexSearchOr");

      if (httpSpecs.length === 0) {
        return _match;
      }

      changed = true;
      const lines = [];

      if (httpSpecs.length > 0) {
        lines.push(
          formatImport(httpSpecs, relImport(abs, "services/http/index.js")),
        );
      }
      if (authSpecs.length > 0) {
        lines.push(
          formatImport(authSpecs, relImport(abs, "services/auth/sendUserWithToken.js")),
        );
      }
      if (utilSpecs.length > 0) {
        lines.push(
          formatImport(utilSpecs, relImport(abs, "utils/buildRegexSearchOr.js")),
        );
      }

      return lines.join("\n");
    });

    if (changed) {
      fs.writeFileSync(abs, next, "utf8");
    }
  }
};

walkAndRewriteImports(SERVER_DIR);

console.log(`Migrated ${HTTP_FILES.length} HTTP utils → services/http/; imports updated`);
