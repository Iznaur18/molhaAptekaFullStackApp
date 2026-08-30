#!/usr/bin/env node
/**
 * Эмулятор 1С: гоняет полный цикл CommerceML против запущенного сервера.
 *
 * Нужен, чтобы проверить сайт до подключения настоящей 1С — и чтобы после
 * подключения понимать, на чьей стороне проблема.
 *
 *   node scripts/onecCommerceMlSmoke.mjs \
 *     --url http://localhost:4444/onec/exchange \
 *     --login 1c-xxxxxxxxxxxx --password ЖивойПароль
 *
 * Логин и пароль берутся на странице «Профиль → 1С» кнопкой
 * «Сгенерировать логин и пароль».
 */
import { buildStoredZip, tinyPngBuffer } from "./lib/buildStoredZip.js";

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const out = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    out[key] = next && !next.startsWith("--") ? next : "true";
    if (out[key] !== "true") index += 1;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const url =
  args.url ||
  process.env.ONEC_SMOKE_URL ||
  `http://localhost:${process.env.PORT || 4444}/onec/exchange`;
const login = args.login || process.env.ONEC_SMOKE_LOGIN || "";
const password = args.password || process.env.ONEC_SMOKE_PASSWORD || "";

if (!login || !password) {
  console.error(
    "Укажите --login и --password (кнопка «Сгенерировать логин и пароль» в кабинете).",
  );
  process.exit(1);
}

const basic = Buffer.from(`${login}:${password}`, "utf8").toString("base64");

const GROUP_ROOT = "smoke-group-root";
const GROUP_LEAF = "smoke-group-leaf";
const GUID_SIMPLE = "smoke-item-simple";
const GUID_VARIANT = "smoke-item-base#smoke-char-1";

const IMPORT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="${new Date().toISOString().slice(0, 19)}">
  <Классификатор>
    <Ид>smoke-cls</Ид>
    <Наименование>Классификатор smoke</Наименование>
    <Группы>
      <Группа>
        <Ид>${GROUP_ROOT}</Ид>
        <Наименование>Smoke: корень</Наименование>
        <Группы>
          <Группа>
            <Ид>${GROUP_LEAF}</Ид>
            <Наименование>Smoke: подгруппа</Наименование>
          </Группа>
        </Группы>
      </Группа>
    </Группы>
  </Классификатор>
  <Каталог СодержитТолькоИзменения="false">
    <Ид>smoke-cat</Ид>
    <ИдКлассификатора>smoke-cls</ИдКлассификатора>
    <Наименование>Каталог smoke</Наименование>
    <Товары>
      <Товар>
        <Ид>${GUID_SIMPLE}</Ид>
        <Артикул>SMOKE-1</Артикул>
        <Наименование>Smoke: простой товар</Наименование>
        <Группы><Ид>${GROUP_LEAF}</Ид></Группы>
        <Описание>Позиция из смоук-теста обмена</Описание>
        <Картинка>import_files/smoke/pixel.png</Картинка>
      </Товар>
      <Товар>
        <Ид>${GUID_VARIANT}</Ид>
        <Наименование>Smoke: товар с характеристикой</Наименование>
        <Группы><Ид>${GROUP_LEAF}</Ид></Группы>
      </Товар>
    </Товары>
  </Каталог>
</КоммерческаяИнформация>`;

const OFFERS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="${new Date().toISOString().slice(0, 19)}">
  <ПакетПредложений>
    <Ид>smoke-pack</Ид>
    <Наименование>Пакет smoke</Наименование>
    <ИдКаталога>smoke-cat</ИдКаталога>
    <ТипыЦен>
      <ТипЦены>
        <Ид>smoke-price-retail</Ид>
        <Наименование>Розничная (smoke)</Наименование>
        <Валюта>руб</Валюта>
      </ТипЦены>
    </ТипыЦен>
    <Склады>
      <Склад Ид="smoke-wh" Наименование="Склад smoke" />
    </Склады>
    <Предложения>
      <Предложение>
        <Ид>${GUID_SIMPLE}</Ид>
        <Наименование>Smoke: простой товар</Наименование>
        <Цены><Цена><ИдТипаЦены>smoke-price-retail</ИдТипаЦены><ЦенаЗаЕдиницу>149,90</ЦенаЗаЕдиницу></Цена></Цены>
        <Склад ИдСклада="smoke-wh" КоличествоНаСкладе="12" />
      </Предложение>
      <Предложение>
        <Ид>${GUID_VARIANT}</Ид>
        <Наименование>Smoke: товар с характеристикой</Наименование>
        <Цены><Цена><ИдТипаЦены>smoke-price-retail</ИдТипаЦены><ЦенаЗаЕдиницу>499</ЦенаЗаЕдиницу></Цена></Цены>
        <Количество>4</Количество>
      </Предложение>
    </Предложения>
  </ПакетПредложений>
</КоммерческаяИнформация>`;

let cookie = "";

/**
 * @param {string} query
 * @param {{ method?: string; body?: Buffer; useAuth?: boolean }} [init]
 */
async function call(query, init = {}) {
  const response = await fetch(`${url}?${query}`, {
    method: init.method ?? "GET",
    headers: {
      ...(init.useAuth ? { Authorization: `Basic ${basic}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.body ? { "Content-Type": "application/octet-stream" } : {}),
    },
    body: init.body,
  });
  const text = await response.text();
  return { status: response.status, text };
}

/** @param {string} label @param {{ status: number; text: string }} result */
function report(label, result) {
  const firstLine = result.text.split("\n")[0];
  const ok = !firstLine.startsWith("failure");
  console.log(`${ok ? "OK " : "FAIL"} ${label} → ${firstLine}`);
  if (!ok) {
    console.error(result.text);
    process.exit(1);
  }
  return result;
}

/** @param {string} type */
async function authenticate(type) {
  cookie = "";
  const result = report(
    `${type}: checkauth`,
    await call(`type=${type}&mode=checkauth`, { useAuth: true }),
  );
  const [, cookieName, cookieValue] = result.text.split("\n");
  cookie = `${cookieName}=${cookieValue}`;
}

console.log(`Обмен: ${url}\nЛогин: ${login}\n`);

// --- Каталог ---
await authenticate("catalog");
report("catalog: init", await call("type=catalog&mode=init", { useAuth: true }));

const archive = buildStoredZip([
  { name: "import.xml", data: Buffer.from(IMPORT_XML, "utf8") },
  { name: "offers.xml", data: Buffer.from(OFFERS_XML, "utf8") },
  { name: "import_files/smoke/pixel.png", data: tinyPngBuffer() },
]);

// Имена как у живой 1С: архив уходит под временным именем, а import
// вызывается по именам файлов ВНУТРИ архива. Иначе смоук проверяет не тот путь.
const archiveName = `v8_${Math.random().toString(16).slice(2, 8)}.zip`;

report(
  `catalog: file ${archiveName} (${archive.length} Б)`,
  await call(`type=catalog&mode=file&filename=${archiveName}`, {
    method: "POST",
    body: archive,
    useAuth: true,
  }),
);

for (const inner of ["import.xml", "offers.xml"]) {
  report(
    `catalog: import ${inner}`,
    await call(`type=catalog&mode=import&filename=${inner}`, { useAuth: true }),
  );
}

// --- Заказы ---
await authenticate("sale");
report("sale: init", await call("type=sale&mode=init", { useAuth: true }));

const query = await call("type=sale&mode=query", { useAuth: true });
if (query.text.startsWith("failure")) {
  report("sale: query", query);
}
const documents = (query.text.match(/<Документ>/g) ?? []).length;
console.log(`OK  sale: query → документов в выгрузке: ${documents}`);

report("sale: success", await call("type=sale&mode=success", { useAuth: true }));

console.log(
  "\nГотово. Разбор каталога идёт в фоне — результат смотрите в кабинете," +
    "\nблок «Приёмка файлов из 1С» (обновляется сам).",
);
