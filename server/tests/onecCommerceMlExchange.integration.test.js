import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
  clearMongoCollections,
} = await import("./helpers/mongoTestDb.js");
const { startHttpTestServer, stopHttpTestServer } = await import(
  "./helpers/httpTestApp.js"
);
const {
  GROUP_VITAMINS,
  OFFER_GUID_SIMPLE,
  OFFER_GUID_VARIANT,
  buildExchangeZip,
  buildImportXml,
  createExchangeSeller,
  createLeafCategory,
  latestJobOfKind,
  runCatalogExchange,
  waitForImportJobs,
} = await import("./helpers/onecExchangeTestHelpers.js");

const { OneCCategoryMappingModel, OneCOrderPushModel, OrderModel, ProductModel } =
  await import("../models/index.js");
const { saveOneCCategoryMappings } = await import(
  "../services/onec/exchange/index.js"
);

/** @type {Awaited<ReturnType<typeof startHttpTestServer>>} */
let http;

before(async () => {
  await connectMongoTestReplSet();
  http = await startHttpTestServer();
});

after(async () => {
  await stopHttpTestServer(http.server);
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

describe("CommerceML обмен: каталог", () => {
  it("проходит checkauth → init → file → import и создаёт карточки", async () => {
    const { seller, credentials } = await createExchangeSeller();

    const result = await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });

    assert.match(result.initBody, /^zip=yes\nfile_limit=\d+$/);
    assert.equal(result.uploadBody, "success");
    // Живая 1С зовёт import по именам файлов ВНУТРИ архива, а не по имени
    // самого архива — оба вызова должны отработать.
    assert.deepEqual(result.importBodies, ["success", "success"]);

    const jobs = await waitForImportJobs(String(seller._id));
    const job = latestJobOfKind(jobs, "catalog");
    assert.equal(job.status, "completed", job.errorMessage);
    assert.equal(job.filename, "import.xml");
    assert.equal(job.stats.catalog.created, 2);
    assert.equal(job.stats.catalog.onlyChanges, false);

    const products = await ProductModel.find({ productSeller: seller._id })
      .sort({ product1cGuid: 1 })
      .lean();
    assert.equal(products.length, 2);

    const aspirin = products.find((p) => p.product1cGuid === OFFER_GUID_SIMPLE);
    assert.ok(aspirin, "простой товар импортирован");
    assert.equal(aspirin.productName, "Аспирин 500 мг");
    assert.equal(aspirin.productArticle, "ASP-500");
    assert.equal(aspirin.productFromOneC, true);
    assert.equal(aspirin.product1cGroupId, GROUP_VITAMINS);
    // Свойство из классификатора разворачивается в человекочитаемое значение.
    assert.deepEqual(aspirin.productCharacteristics.map((c) => [c.key, c.value]), [
      ["Дозировка", "500 мг"],
    ]);
    assert.equal(aspirin.productImageUrls.length, 1);
    assert.equal(aspirin.product1cImageHashes.length, 1);

    // Торговое предложение с характеристикой — отдельная карточка: вариаций
    // в модели товара нет, `Ид` вида `товар#характеристика` хранится целиком.
    const variant = products.find((p) => p.product1cGuid === OFFER_GUID_VARIANT);
    assert.ok(variant, "торговое предложение импортировано");
    assert.ok(variant.product1cGuid.includes("#"));
  });

  it("держит товары вне витрины, пока группа не сопоставлена", async () => {
    const { seller, credentials } = await createExchangeSeller();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id));

    const products = await ProductModel.find({ productSeller: seller._id }).lean();
    for (const product of products) {
      assert.equal(product.productCategoryId, null);
      assert.equal(product.productIsAvailable, false);
      assert.equal(product.productModerationStatus, "pending");
    }
  });

  it("применяет цену выбранного типа и остаток выбранного склада", async () => {
    const { seller, credentials } = await createExchangeSeller();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id));

    const aspirin = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();

    // Розничная 120,50 (запятая как разделитель), а не оптовая 90,50.
    assert.equal(aspirin.productPrice, 120.5);
    // Только основной склад: 7, а не 107 с удалённым.
    assert.equal(aspirin.productStockQuantity, 7);

    const variant = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_VARIANT,
    }).lean();
    assert.equal(variant.productPrice, 899);
    // Без разбивки по складам берём общее `<Количество>`.
    assert.equal(variant.productStockQuantity, 3);
  });

  it("после сопоставления категории выводит товары на витрину", async () => {
    const { seller, credentials } = await createExchangeSeller();
    const leaf = await createLeafCategory();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id));

    const mappings = await OneCCategoryMappingModel.find({
      sellerId: seller._id,
    }).lean();
    assert.equal(mappings.length, 2, "корневая группа и подгруппа сохранены");

    const saved = await saveOneCCategoryMappings(String(seller._id), [
      { externalId: GROUP_VITAMINS, categoryId: String(leaf._id) },
    ]);
    assert.equal(saved.remapped, 2, "обе карточки перевешены сразу");

    const afterMapping = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();
    assert.equal(String(afterMapping.productCategoryId), String(leaf._id));
    assert.equal(afterMapping.categoryBreadcrumbRu, "Аптека › Витамины");
    // Витрину открывает только следующий пакет предложений: категория
    // проставлена, но `productIsAvailable` пересчитывается в offers.
    assert.equal(afterMapping.productIsAvailable, false);

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id), 4);

    const published = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();
    assert.equal(published.productIsAvailable, true);
    assert.equal(published.productStockQuantity, 7);
  });

  it("не перезаливает картинку с тем же содержимым", async () => {
    const { seller, credentials } = await createExchangeSeller();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    const first = latestJobOfKind(
      await waitForImportJobs(String(seller._id)),
      "catalog",
    );
    assert.equal(first.status, "completed", first.errorMessage);
    assert.equal(first.stats.catalog.imagesUploaded, 1);

    const before = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    const second = latestJobOfKind(
      await waitForImportJobs(String(seller._id), 4),
      "catalog",
    );
    assert.equal(second.stats.catalog.imagesUploaded, 0);

    const after = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();
    assert.deepEqual(after.productImageUrls, before.productImageUrls);
  });

  it("снимает с витрины пропавшее из полной выгрузки, но не из частичной", async () => {
    const { seller, credentials } = await createExchangeSeller();
    const leaf = await createLeafCategory();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id));
    await saveOneCCategoryMappings(String(seller._id), [
      { externalId: GROUP_VITAMINS, categoryId: String(leaf._id) },
    ]);
    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id), 4);

    const { buildStoredZip } = await import("./helpers/zipTestHelpers.js");

    // Частичная выгрузка без второго товара: он остаётся на витрине.
    const partial = buildImportXml({ onlyChanges: true }).replace(
      /<Товар>\s*<Ид>bbbbbbbb[\s\S]*?<\/Товар>/,
      "",
    );
    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildStoredZip([
        { name: "import.xml", data: Buffer.from(partial, "utf8") },
      ]),
      importNames: ["import.xml"],
    });
    await waitForImportJobs(String(seller._id), 5);

    const survived = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_VARIANT,
    }).lean();
    assert.equal(survived.productIsAvailable, true);

    // Полная — снимает.
    const full = buildImportXml({ onlyChanges: false }).replace(
      /<Товар>\s*<Ид>bbbbbbbb[\s\S]*?<\/Товар>/,
      "",
    );
    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildStoredZip([
        { name: "import.xml", data: Buffer.from(full, "utf8") },
      ]),
      importNames: ["import.xml"],
    });
    await waitForImportJobs(String(seller._id), 6);

    const removed = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_VARIANT,
    }).lean();
    assert.equal(removed.productIsAvailable, false);
    assert.equal(removed.productStockQuantity, 0);
  });
});

describe("CommerceML обмен: авторизация", () => {
  it("отвечает failure на неверный пароль", async () => {
    const { credentials } = await createExchangeSeller();
    const basic = Buffer.from(`${credentials.login}:wrong`, "utf8").toString(
      "base64",
    );

    const response = await http.request(
      "/onec/exchange?type=catalog&mode=checkauth",
      { headers: { Authorization: `Basic ${basic}` } },
    );
    const body = await response.text();

    // 1С читает тело, а не код: HTTP-200 с `failure` — это и есть отказ.
    assert.equal(response.status, 200);
    assert.match(body, /^failure\n/);
  });

  it("не пускает без сессии", async () => {
    const response = await http.request("/onec/exchange?type=catalog&mode=init");
    const body = await response.text();
    assert.match(body, /^failure\n/);
  });

  it("отклоняет обход каталога в имени файла", async () => {
    const { credentials } = await createExchangeSeller();
    const basic = Buffer.from(
      `${credentials.login}:${credentials.password}`,
      "utf8",
    ).toString("base64");

    const checkAuth = await http.request(
      "/onec/exchange?type=catalog&mode=checkauth",
      { headers: { Authorization: `Basic ${basic}` } },
    );
    const [, cookieName, cookieValue] = (await checkAuth.text()).split("\n");

    const response = await http.request(
      "/onec/exchange?type=catalog&mode=file&filename=..%2F..%2Fevil.xml",
      {
        method: "POST",
        headers: { Cookie: `${cookieName}=${cookieValue}` },
        body: Buffer.from("<xml/>", "utf8"),
      },
    );
    const body = await response.text();
    assert.match(body, /^failure\n/);
  });
});

describe("CommerceML обмен: заказы", () => {
  it("отдаёт заказ в query и помечает переданным после success", async () => {
    const { seller, credentials } = await createExchangeSeller();
    const leaf = await createLeafCategory();

    await runCatalogExchange({
      request: http.request,
      login: credentials.login,
      password: credentials.password,
      archive: buildExchangeZip(),
    });
    await waitForImportJobs(String(seller._id));
    await saveOneCCategoryMappings(String(seller._id), [
      { externalId: GROUP_VITAMINS, categoryId: String(leaf._id) },
    ]);

    const product = await ProductModel.findOne({
      productSeller: seller._id,
      product1cGuid: OFFER_GUID_SIMPLE,
    }).lean();

    const order = await OrderModel.create({
      userBuyerId: seller._id,
      items: [
        {
          productId: product._id,
          quantity: 2,
          unitPriceAtOrder: 120.5,
          productNameAtOrder: "Аспирин 500 мг",
        },
      ],
      totalAmount: 241,
      deliveryAddress: "г Москва, ул Тверская, д 1",
      fulfillmentMethod: "pickup",
      paymentMethod: "cashOnDelivery",
    });
    const push = await OneCOrderPushModel.create({
      orderId: order._id,
      sellerId: seller._id,
    });

    const basic = Buffer.from(
      `${credentials.login}:${credentials.password}`,
      "utf8",
    ).toString("base64");
    const checkAuth = await http.request(
      "/onec/exchange?type=sale&mode=checkauth",
      { headers: { Authorization: `Basic ${basic}` } },
    );
    const [, cookieName, cookieValue] = (await checkAuth.text()).split("\n");
    const cookie = `${cookieName}=${cookieValue}`;

    const query = await http.request("/onec/exchange?type=sale&mode=query", {
      headers: { Cookie: cookie },
    });
    const xml = await query.text();

    assert.match(xml, /<КоммерческаяИнформация/);
    assert.match(xml, new RegExp(`<Ид>${OFFER_GUID_SIMPLE}</Ид>`));
    assert.match(xml, /<Количество>2<\/Количество>/);
    assert.match(xml, /<Сумма>241\.00<\/Сумма>/);

    // До подтверждения заказ ещё не считается переданным.
    const midway = await OneCOrderPushModel.findById(push._id).lean();
    assert.equal(midway.status, "pending");

    const success = await http.request("/onec/exchange?type=sale&mode=success", {
      headers: { Cookie: cookie },
    });
    assert.equal(await success.text(), "success");

    const confirmed = await OneCOrderPushModel.findById(push._id).lean();
    assert.equal(confirmed.status, "synced");
    assert.ok(confirmed.syncedAt);
  });
});
