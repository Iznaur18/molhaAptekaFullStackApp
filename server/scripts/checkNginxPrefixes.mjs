#!/usr/bin/env node
/**
 * Сверяет живой конфиг nginx со списком API-префиксов из репозитория.
 *
 * Недостающее звено в цепочке проверок. `tests/nginxApiPrefixes.test.js` уже
 * сверяет `createApp.js` с `docs/deploy/nginx-api-prefixes.txt`, а
 * `nginxDeployApiPrefixes.test.js` — пример конфига с прокси разработки. Обе
 * читают только репозиторий, и обе спокойно проходили, пока на боевом сервере
 * не было блока `location /sellers`: настройки продавца сохранялись в никуда,
 * PUT возвращал 405, а GET — HTML с кодом 200.
 *
 * Никто не сверял репозиторий с тем, что реально стоит на сервере. Этот скрипт
 * сверяет.
 *
 * Конфиг читается из файла или со stdin, чтобы скрипт ничего не знал про ssh:
 *
 *     ssh root@host 'cat /etc/nginx/sites-enabled/gitorg' \
 *       | node server/scripts/checkNginxPrefixes.mjs
 *
 *     node server/scripts/checkNginxPrefixes.mjs путь/к/конфигу
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PREFIXES_PATH = fileURLToPath(
  new URL("../docs/deploy/nginx-api-prefixes.txt", import.meta.url),
);

/**
 * Префиксы, которые обязан проксировать nginx.
 *
 * @param {string} source содержимое nginx-api-prefixes.txt
 * @returns {string[]}
 */
export function parseRequiredPrefixes(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean)
    .sort();
}

/**
 * Шаблоны из директив `location`, приведённые к сравнимому виду.
 *
 * Модификаторы (`~`, `~*`, `^~`, `=`), кавычки и якорь `^` снимаются: важен
 * только путь, с которого шаблон начинается. Именованные локации (`@name`)
 * пропускаем — они не сопоставляются с URI.
 *
 * @param {string} conf
 * @returns {string[]}
 */
export function parseNginxLocationPatterns(conf) {
  /** @type {string[]} */
  const patterns = [];

  for (const line of conf.split(/\r?\n/)) {
    const match = line.match(/^\s*location\s+(.+?)\s*\{\s*$/);
    if (!match) continue;

    let pattern = match[1].trim();
    pattern = pattern.replace(/^(=|~\*|~|\^~)\s*/, "");
    pattern = pattern.replace(/^["']|["']$/g, "");
    pattern = pattern.replace(/^\^/, "");
    if (pattern.startsWith("@")) continue;

    patterns.push(pattern);
  }

  return patterns;
}

/**
 * Покрыт ли префикс этим шаблоном.
 *
 * Совпадение по началу строки не годится: `/users-loyalty-raffle` начинается с
 * `/user`, но запросы к `/user` не обслуживает. Поэтому после префикса
 * требуем границу — конец шаблона, `/`, или начало регулярной группы.
 *
 * @param {string} pattern
 * @param {string} prefix
 */
export function patternCoversPrefix(pattern, prefix) {
  if (pattern === prefix) return true;
  if (!pattern.startsWith(prefix)) return false;
  const next = pattern.slice(prefix.length, prefix.length + 1);
  return next === "/" || next === "(" || next === "$" || next === "\\";
}

/**
 * Префиксы, которых нет в конфиге.
 *
 * @param {{ required: string[]; conf: string }} input
 * @returns {string[]}
 */
export function findMissingPrefixes({ required, conf }) {
  const patterns = parseNginxLocationPatterns(conf);
  return required.filter(
    (prefix) => !patterns.some((pattern) => patternCoversPrefix(pattern, prefix)),
  );
}

/** @param {NodeJS.ReadableStream} stream */
async function readStream(stream) {
  /** @type {Buffer[]} */
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const [, , configPath] = process.argv;
  const conf = configPath
    ? readFileSync(configPath, "utf8")
    : await readStream(process.stdin);

  if (conf.trim() === "") {
    console.error("ОШИБКА: конфиг nginx пуст — проверять нечего");
    process.exit(2);
  }

  const required = parseRequiredPrefixes(readFileSync(PREFIXES_PATH, "utf8"));
  const missing = findMissingPrefixes({ required, conf });

  if (missing.length === 0) {
    console.log(`nginx знает все ${required.length} префиксов API`);
    return;
  }

  console.error("В конфиге nginx нет блоков location для префиксов:");
  for (const prefix of missing) console.error(`  ${prefix}`);
  console.error("");
  console.error("Запросы к ним уходят в раздачу SPA: GET вернёт HTML с кодом");
  console.error("200, остальные методы — 405. Образец блока и порядок правки —");
  console.error("docs/deploy/nginx-izibuy.conf.example.");
  process.exit(1);
}

// Под тестами файл только импортируется; запускаемся, лишь когда позвали руками.
// Сравниваем реальные пути, а не суффиксы строк: на Windows argv[1] приходит с
// обратными слэшами и буквой диска, и суффиксная проверка там ненадёжна.
const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  await main();
}
