import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.join(__dirname, "../routes");

const MUTATION_RE = /router\.(post|put|patch)\(\s*[\r\n\s]*["'`]([^"'`]+)["'`]/g;

const VALIDATION_RE = /Validation|validateBodyZod|validateParamsZod/;

/** Маршруты без body — param-only или action без payload. */
const ALLOWED_WITHOUT_BODY_VALIDATION = new Set([
  "authRouter.js:POST:/logout",
  "authRouter.js:POST:/refresh",
  "userRouter.js:POST:/:userIdClient/follow",
  "userRouter.js:POST:/stories/:storyId/view",
  "userRouter.js:POST:/me/premium/purchase",
  "installmentRouter.js:PATCH:/contracts/:contractId/payments/:paymentIndex/mark-paid",
  "installmentRouter.js:PATCH:/contracts/:contractId/payments/:paymentIndex/confirm",
  "installmentRouter.js:PATCH:/contracts/:contractId/payments/:paymentIndex/reject",
  "installmentRouter.js:PATCH:/contracts/:contractId/pay-early",
  "installmentRouter.js:PATCH:/contracts/:contractId/pay-early/cancel",
  "installmentRouter.js:PATCH:/contracts/:contractId/pay-early/reject",
  "installmentRouter.js:PATCH:/contracts/:contractId/pay-early/confirm",
  "uploadRouter.js:POST:/image",
  "uploadRouter.js:POST:/video",
  "uploadRouter.js:POST:/",
  "productRouter.js:POST:/bulk-import",
  "onecRouter.js:POST:/test",
  "onecRouter.js:POST:/sync",
  // Действие без payload — выдаёт новую пару логин/пароль обмена.
  "onecRouter.js:POST:/exchange-credentials",
  // Тело `mode=file` — бинарный поток CommerceML, его читает сам контроллер
  // (роутер смонтирован до express.json). Параметры приходят в query.
  "onecExchangeRouter.js:POST:/",
  // Уведомление ЮKassa. Схема тут дала бы ложную уверенность: телу мы не
  // верим вовсе, из него берётся только `object.id`, а статус и сумма
  // перезапрашиваются в API. Плюс жёсткая схема отвергала бы новые поля,
  // которые провайдер вправе добавить в любой момент.
  "paymentRouter.js:POST:/yookassa/webhook",
  "productRouter.js:POST:/raffles/unlock-create",
  "productRouter.js:POST:/raffles/cancel-create",
]);

const extractRouteBlocks = (source) => {
  const blocks = [];
  let match = MUTATION_RE.exec(source);

  while (match) {
    const method = match[1].toUpperCase();
    const routePath = match[2];
    const start = match.index;
    const openParen = source.indexOf("(", start);
    let depth = 0;
    let end = openParen;

    for (; end < source.length; end += 1) {
      const char = source[end];
      if (char === "(") depth += 1;
      if (char === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
    }

    blocks.push({
      method,
      routePath,
      block: source.slice(start, end + 1),
    });
    match = MUTATION_RE.exec(source);
  }

  return blocks;
};

export const auditRouteBodyValidation = () => {
  const routeFiles = fs
    .readdirSync(ROUTES_DIR)
    .filter((name) => name.endsWith("Router.js"))
    .sort();

  const gaps = [];
  const covered = [];

  for (const fileName of routeFiles) {
    const source = fs.readFileSync(path.join(ROUTES_DIR, fileName), "utf8");
    const blocks = extractRouteBlocks(source);

    for (const { method, routePath, block } of blocks) {
      const key = `${fileName}:${method}:${routePath}`;
      const hasValidation = VALIDATION_RE.test(block);

      if (hasValidation) {
        covered.push(key);
        continue;
      }

      if (ALLOWED_WITHOUT_BODY_VALIDATION.has(key)) {
        covered.push(`${key} (allowlist)`);
        continue;
      }

      gaps.push(key);
    }
  }

  return { covered, gaps, routeFiles: routeFiles.length };
};

const isMain = process.argv[1]?.endsWith("auditRouteBodyValidation.js");

if (isMain) {
  const { covered, gaps } = auditRouteBodyValidation();

  console.log(`Covered: ${covered.length}`);
  for (const item of covered) {
    console.log(`  ✓ ${item}`);
  }

  if (gaps.length === 0) {
    console.log("\n✓ No unvalidated mutation routes outside allowlist");
    process.exit(0);
  }

  console.log(`\nGaps (${gaps.length}):`);
  for (const gap of gaps) {
    console.log(`  ✗ ${gap}`);
  }
  process.exit(1);
}
