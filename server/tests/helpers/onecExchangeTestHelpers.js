import { ONEC_CHANNEL_COMMERCEML } from "../../constants/onecExchangeConstants.js";
import { OneCImportJobModel, ProductCategoryModel, UserModel } from "../../models/index.js";
import { regenerateOneCExchangeCredentials } from "../../services/onec/exchange/index.js";
import { buildStoredZip, tinyPngBuffer } from "./zipTestHelpers.js";

const GROUP_VITAMINS = "11111111-1111-1111-1111-111111111111";
const GROUP_ROOT = "00000000-0000-0000-0000-000000000000";
export const OFFER_GUID_SIMPLE = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const OFFER_GUID_VARIANT =
  "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb#cccccccc-cccc-cccc-cccc-cccccccccccc";
export const PRICE_TYPE_RETAIL = "price-retail";
export const PRICE_TYPE_WHOLESALE = "price-wholesale";
export const WAREHOUSE_MAIN = "wh-main";
export const WAREHOUSE_REMOTE = "wh-remote";

export { GROUP_VITAMINS, GROUP_ROOT };

/**
 * Каталог CommerceML: корневая группа с подгруппой, простой товар с картинкой
 * и торговое предложение с характеристикой (`Ид` вида `товар#характеристика`).
 *
 * @param {{ onlyChanges?: boolean }} [opts]
 */
export function buildImportXml(opts = {}) {
  const onlyChanges = opts.onlyChanges === true ? "true" : "false";
  return `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="2026-08-30T10:00:00">
  <Классификатор>
    <Ид>cls-1</Ид>
    <Наименование>Классификатор</Наименование>
    <Группы>
      <Группа>
        <Ид>${GROUP_ROOT}</Ид>
        <Наименование>Аптека</Наименование>
        <Группы>
          <Группа>
            <Ид>${GROUP_VITAMINS}</Ид>
            <Наименование>Витамины</Наименование>
          </Группа>
        </Группы>
      </Группа>
    </Группы>
    <Свойства>
      <Свойство>
        <Ид>prop-1</Ид>
        <Наименование>Дозировка</Наименование>
        <ВариантыЗначений>
          <Справочник>
            <ИдЗначения>val-1</ИдЗначения>
            <Значение>500 мг</Значение>
          </Справочник>
        </ВариантыЗначений>
      </Свойство>
    </Свойства>
  </Классификатор>
  <Каталог СодержитТолькоИзменения="${onlyChanges}">
    <Ид>cat-1</Ид>
    <ИдКлассификатора>cls-1</ИдКлассификатора>
    <Наименование>Каталог</Наименование>
    <Товары>
      <Товар>
        <Ид>${OFFER_GUID_SIMPLE}</Ид>
        <Артикул>ASP-500</Артикул>
        <Наименование>Аспирин 500 мг</Наименование>
        <Группы><Ид>${GROUP_VITAMINS}</Ид></Группы>
        <Описание>Жаропонижающее</Описание>
        <Картинка>import_files/aa/aspirin.png</Картинка>
        <ЗначенияСвойств>
          <ЗначенияСвойства>
            <Ид>prop-1</Ид>
            <Значение>val-1</Значение>
          </ЗначенияСвойства>
        </ЗначенияСвойств>
      </Товар>
      <Товар>
        <Ид>${OFFER_GUID_VARIANT}</Ид>
        <Наименование>Витамин D3, 60 капсул</Наименование>
        <Группы><Ид>${GROUP_VITAMINS}</Ид></Группы>
        <ЗначенияРеквизитов>
          <ЗначениеРеквизита>
            <Наименование>Форма выпуска</Наименование>
            <Значение>Капсулы</Значение>
          </ЗначениеРеквизита>
        </ЗначенияРеквизитов>
      </Товар>
    </Товары>
  </Каталог>
</КоммерческаяИнформация>`;
}

/**
 * Пакет предложений: два типа цены и два склада, чтобы проверить фильтрацию.
 *
 * @param {{ variantQuantity?: number }} [opts] остаток товара без картинки —
 *   именно он решает, попадёт ли такая номенклатура на сайт
 */
export function buildOffersXml(opts = {}) {
  const variantQuantity = opts.variantQuantity ?? 3;
  return `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="2026-08-30T10:00:00">
  <ПакетПредложений>
    <Ид>pack-1</Ид>
    <Наименование>Пакет предложений</Наименование>
    <ИдКаталога>cat-1</ИдКаталога>
    <ТипыЦен>
      <ТипЦены>
        <Ид>${PRICE_TYPE_RETAIL}</Ид>
        <Наименование>Розничная</Наименование>
        <Валюта>руб</Валюта>
      </ТипЦены>
      <ТипЦены>
        <Ид>${PRICE_TYPE_WHOLESALE}</Ид>
        <Наименование>Оптовая</Наименование>
        <Валюта>руб</Валюта>
      </ТипЦены>
    </ТипыЦен>
    <Склады>
      <Склад Ид="${WAREHOUSE_MAIN}" Наименование="Основной" />
      <Склад Ид="${WAREHOUSE_REMOTE}" Наименование="Удалённый" />
    </Склады>
    <Предложения>
      <Предложение>
        <Ид>${OFFER_GUID_SIMPLE}</Ид>
        <Артикул>ASP-500</Артикул>
        <Наименование>Аспирин 500 мг</Наименование>
        <Цены>
          <Цена>
            <ИдТипаЦены>${PRICE_TYPE_WHOLESALE}</ИдТипаЦены>
            <ЦенаЗаЕдиницу>90,50</ЦенаЗаЕдиницу>
          </Цена>
          <Цена>
            <ИдТипаЦены>${PRICE_TYPE_RETAIL}</ИдТипаЦены>
            <ЦенаЗаЕдиницу>120,50</ЦенаЗаЕдиницу>
          </Цена>
        </Цены>
        <Склад ИдСклада="${WAREHOUSE_MAIN}" КоличествоНаСкладе="7" />
        <Склад ИдСклада="${WAREHOUSE_REMOTE}" КоличествоНаСкладе="100" />
      </Предложение>
      <Предложение>
        <Ид>${OFFER_GUID_VARIANT}</Ид>
        <Наименование>Витамин D3, 60 капсул</Наименование>
        <Цены>
          <Цена>
            <ИдТипаЦены>${PRICE_TYPE_RETAIL}</ИдТипаЦены>
            <ЦенаЗаЕдиницу>899</ЦенаЗаЕдиницу>
          </Цена>
        </Цены>
        <Количество>${variantQuantity}</Количество>
      </Предложение>
    </Предложения>
  </ПакетПредложений>
</КоммерческаяИнформация>`;
}

/**
 * @param {{ onlyChanges?: boolean; variantQuantity?: number }} [opts]
 * @returns {Buffer}
 */
export function buildExchangeZip(opts = {}) {
  return buildStoredZip([
    { name: "import.xml", data: Buffer.from(buildImportXml(opts), "utf8") },
    { name: "offers.xml", data: Buffer.from(buildOffersXml(opts), "utf8") },
    { name: "import_files/aa/aspirin.png", data: tinyPngBuffer() },
  ]);
}

/**
 * Продавец с адресом и координатами (иначе новые карточки создаются без точки
 * самовывоза) и выданными доступами обмена.
 *
 * @param {{ priceTypeIds?: string[]; warehouseIds?: string[] }} [opts]
 */
export async function createExchangeSeller(opts = {}) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const seller = await UserModel.create({
    userName: `onec_seller_${suffix}`,
    email: `onec_seller_${suffix}@test.local`,
    passwordHash: "hash",
    userAddress: "г Москва, ул Тверская, д 1",
    userAddressFlat: "",
    userAddressGeo: { lat: 55.757, lon: 37.61 },
    oneCIntegration: {
      enabled: true,
      channel: ONEC_CHANNEL_COMMERCEML,
      exchange: {
        priceTypeIds: opts.priceTypeIds ?? [PRICE_TYPE_RETAIL],
        warehouseIds: opts.warehouseIds ?? [WAREHOUSE_MAIN],
      },
    },
  });

  const credentials = await regenerateOneCExchangeCredentials(String(seller._id));
  return { seller, credentials };
}

/**
 * Пара «корень → лист» дерева категорий сайта, куда продавец сопоставит группу.
 */
export async function createLeafCategory() {
  const root = await ProductCategoryModel.create({
    slug: "pharmacy",
    labelRu: "Аптека",
    parentId: null,
    depth: 0,
    pathSlugs: [],
    pathIds: [],
    pathLabelRu: [],
    isLeaf: false,
    legacyProductCategory: "pharmacy",
  });

  return ProductCategoryModel.create({
    slug: "pharmacy-vitamins",
    labelRu: "Витамины",
    parentId: root._id,
    depth: 1,
    pathSlugs: ["pharmacy"],
    pathIds: [root._id],
    pathLabelRu: ["Аптека"],
    isLeaf: true,
    searchKeywords: ["витамины"],
  });
}

/**
 * Без Redis разбор идёт inline в `setImmediate` — ждём фактического завершения,
 * а не «примерно секунду».
 *
 * @param {string} sellerId
 * @param {number} [expectedCount]
 */
export async function waitForImportJobs(sellerId, expectedCount = 2) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const jobs = await OneCImportJobModel.find({ sellerId })
      .sort({ createdAt: -1 })
      .lean();
    const finished = jobs.filter(
      (job) => job.status === "completed" || job.status === "failed",
    );
    if (finished.length >= expectedCount) return finished;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Разбор пакета 1С не завершился за 30 с");
}

/**
 * Один обмен = несколько задач разбора (по одной на файл внутри архива),
 * поэтому в тестах нужна не «последняя», а «последняя нужного вида».
 *
 * @param {Array<Record<string, any>>} jobs
 * @param {"catalog" | "offers"} kind
 */
export function latestJobOfKind(jobs, kind) {
  const found = jobs.find((job) => job.kind === kind);
  if (!found) {
    throw new Error(`Нет задачи разбора вида ${kind}: ${jobs.map((j) => j.filename + ":" + j.kind).join(", ")}`);
  }
  return found;
}

/**
 * Полный цикл `type=catalog`: checkauth → init → file → import.
 *
 * Воспроизводит поведение живой 1С: архив заливается под временным именем
 * (`v8_E902_1f.zip`), а `mode=import` зовётся по именам файлов ВНУТРИ архива.
 * Пока тест звал import по имени архива, баг резолвинга был не виден.
 *
 * @param {{
 *   request: (path: string, init?: RequestInit) => Promise<Response>;
 *   login: string;
 *   password: string;
 *   archive: Buffer;
 *   filename?: string;
 *   importNames?: string[];
 * }} params
 */
export async function runCatalogExchange({
  request,
  login,
  password,
  archive,
  filename = `v8_${Math.random().toString(16).slice(2, 8)}.zip`,
  importNames = ["import.xml", "offers.xml"],
}) {
  const basic = Buffer.from(`${login}:${password}`, "utf8").toString("base64");

  const checkAuth = await request("/onec/exchange?type=catalog&mode=checkauth", {
    headers: { Authorization: `Basic ${basic}` },
  });
  const checkAuthBody = await checkAuth.text();
  const [status, cookieName, cookieValue] = checkAuthBody.split("\n");
  if (status !== "success") {
    throw new Error(`checkauth: ${checkAuthBody}`);
  }
  const cookie = `${cookieName}=${cookieValue}`;

  const init = await request("/onec/exchange?type=catalog&mode=init", {
    headers: { Cookie: cookie },
  });
  const initBody = await init.text();

  const upload = await request(
    `/onec/exchange?type=catalog&mode=file&filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      headers: { Cookie: cookie, "Content-Type": "application/octet-stream" },
      body: archive,
    },
  );
  const uploadBody = await upload.text();

  /** @type {string[]} */
  const importBodies = [];
  for (const name of importNames) {
    const imported = await request(
      `/onec/exchange?type=catalog&mode=import&filename=${encodeURIComponent(name)}`,
      { headers: { Cookie: cookie } },
    );
    importBodies.push(await imported.text());
  }

  return {
    cookie,
    checkAuthBody,
    initBody,
    uploadBody,
    importBody: importBodies[0],
    importBodies,
  };
}
