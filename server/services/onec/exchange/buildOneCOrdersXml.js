import {
  ONEC_ORDER_PUSH_FAILED,
  ONEC_ORDER_PUSH_MAX_ATTEMPTS,
  ONEC_ORDER_PUSH_PENDING,
  ONEC_ORDER_PUSH_SYNCED,
} from "../../../constants/onecConstants.js";
import {
  ONEC_ORDER_STATUS_LABELS,
  ONEC_PAYMENT_METHOD_LABELS,
} from "../../../constants/onecExchangeConstants.js";
import {
  OneCOrderPushModel,
  OrderModel,
  ProductModel,
  UserModel,
} from "../../../models/index.js";

/** Сколько заказов отдаём за один `mode=query`. */
const ORDERS_PER_QUERY = 100;

const UNIT_CODE = "796";
const UNIT_SHORT = "шт";
const UNIT_FULL = "Штука";
const UNIT_INTL = "PCE";
/** Стабильный склад «сайта» — у маркетплейса нет 1С-склада продавца. */
const SITE_WAREHOUSE_ID = "00000000-0000-4000-8000-000000000001";
const SITE_WAREHOUSE_NAME = "Склад сайта";

/**
 * @param {unknown} value
 */
export function escapeXml(value) {
  return (
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      // Управляющие символы XML 1.0 не принимает ни в каком виде — 1С на таком
      // документе падает с ошибкой разбора.
      // eslint-disable-next-line no-control-regex -- вырезаем их намеренно
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  );
}

/** @param {Date} date */
const formatDate = (date) => date.toISOString().slice(0, 10);
/** @param {Date} date */
const formatTime = (date) => date.toISOString().slice(11, 19);

/** @param {number} value */
const formatMoney = (value) => (Math.round(Number(value) * 100) / 100).toFixed(2);

/**
 * Ид документа для 1С: без `:`, иначе XDTO/Bitrix часто валит весь пакет.
 * Для одного продавца orderId уникален; чужие позиции в документ не попадают.
 *
 * @param {unknown} orderId
 */
export function buildOneCOrderDocumentId(orderId) {
  return String(orderId ?? "").trim();
}

/**
 * @param {string} name
 * @param {string} value
 */
const requisitesRow = (name, value) => `      <ЗначениеРеквизита>
        <Наименование>${escapeXml(name)}</Наименование>
        <Значение>${escapeXml(value)}</Значение>
      </ЗначениеРеквизита>`;

/**
 * @param {{
 *   guid: string;
 *   name: string;
 *   quantity: number;
 *   price: number;
 * }} line
 */
function buildOrderProductXml(line) {
  const sum = formatMoney(line.price * line.quantity);
  const price = formatMoney(line.price);
  return `      <Товар>
        <Ид>${escapeXml(line.guid)}</Ид>
        <Наименование>${escapeXml(line.name)}</Наименование>
        <БазоваяЕдиница Код="${UNIT_CODE}" НаименованиеПолное="${UNIT_FULL}" МеждународноеСокращение="${UNIT_INTL}">${UNIT_SHORT}</БазоваяЕдиница>
        <СтавкиНалогов>
          <СтавкаНалога>
            <Наименование>НДС</Наименование>
            <Ставка>0</Ставка>
          </СтавкаНалога>
        </СтавкиНалогов>
        <ЗначенияРеквизитов>
${requisitesRow("ВидНоменклатуры", "Товар")}
${requisitesRow("ТипНоменклатуры", "Товар")}
        </ЗначенияРеквизитов>
        <Единица>
          <Ид>${UNIT_CODE}</Ид>
          <НаименованиеКраткое>${UNIT_SHORT}</НаименованиеКраткое>
          <Код>${UNIT_CODE}</Код>
          <НаименованиеПолное>${UNIT_FULL}</НаименованиеПолное>
        </Единица>
        <Коэффициент>1</Коэффициент>
        <Количество>${line.quantity}</Количество>
        <Цена>${price}</Цена>
        <ЦенаЗаЕдиницу>${price}</ЦенаЗаЕдиницу>
        <Сумма>${sum}</Сумма>
        <Налоги>
          <Налог>
            <Наименование>НДС</Наименование>
            <УчтеноВСумме>true</УчтеноВСумме>
            <Сумма>0</Сумма>
            <Ставка>0</Ставка>
          </Налог>
        </Налоги>
      </Товар>`;
}

/**
 * @param {{
 *   order: Record<string, any>;
 *   lines: Array<{ guid: string; name: string; quantity: number; price: number }>;
 *   buyer: Record<string, any> | null;
 * }} params
 */
export function buildOrderDocument({ order, lines, buyer }) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const total = lines.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const documentId = buildOneCOrderDocumentId(order._id);
  const isCancelled = String(order.status ?? "") === "cancelled";
  const address = [order.deliveryAddress, order.deliveryAddressFlat]
    .filter(Boolean)
    .join(", ");
  const paymentLabel =
    ONEC_PAYMENT_METHOD_LABELS[order.paymentMethod] ??
    String(order.paymentMethod ?? "");
  const statusLabel =
    ONEC_ORDER_STATUS_LABELS[order.status] ?? String(order.status ?? "");
  const deliveryLabel =
    order.fulfillmentMethod === "delivery" ? "Доставка" : "Самовывоз";

  const buyerName = buyer?.userName || "Покупатель маркетплейса";

  const contacts = [];
  if (buyer?.userPhoneNumber) {
    contacts.push(
      `          <Контакт>
            <Тип>Телефон рабочий</Тип>
            <Значение>${escapeXml(buyer.userPhoneNumber)}</Значение>
          </Контакт>`,
    );
  }
  if (buyer?.email) {
    contacts.push(
      `          <Контакт>
            <Тип>Электронная почта</Тип>
            <Значение>${escapeXml(buyer.email)}</Значение>
          </Контакт>`,
    );
  }

  return `  <Документ>
    <Ид>${escapeXml(documentId)}</Ид>
    <ПометкаУдаления>${isCancelled ? "true" : "false"}</ПометкаУдаления>
    <Номер>${escapeXml(documentId)}</Номер>
    <Дата>${formatDate(createdAt)}</Дата>
    <Время>${formatTime(createdAt)}</Время>
    <ХозОперация>Заказ товара</ХозОперация>
    <Контрагенты>
      <Контрагент>
        <Ид>${escapeXml(String(order.userBuyerId ?? ""))}</Ид>
        <Наименование>${escapeXml(buyerName)}</Наименование>
        <ПолноеНаименование>${escapeXml(buyerName)}</ПолноеНаименование>
        <Роль>Покупатель</Роль>
        <ИНН></ИНН>
        <КПП></КПП>
        <КодПоОКПО></КодПоОКПО>
        <Адрес>
          <Представление>${escapeXml(address)}</Представление>
        </Адрес>
${
  contacts.length > 0
    ? `        <Контакты>\n${contacts.join("\n")}\n        </Контакты>\n`
    : ""
}      </Контрагент>
    </Контрагенты>
    <Склады>
      <Склад>
        <Ид>${SITE_WAREHOUSE_ID}</Ид>
        <Наименование>${SITE_WAREHOUSE_NAME}</Наименование>
      </Склад>
    </Склады>
    <Валюта>руб.</Валюта>
    <Курс>1.0000</Курс>
    <Сумма>${formatMoney(total)}</Сумма>
    <Роль>Продавец</Роль>
    <Комментарий></Комментарий>
    <Налоги>
      <Налог>
        <Наименование>НДС</Наименование>
        <УчтеноВСумме>true</УчтеноВСумме>
        <Сумма>0</Сумма>
      </Налог>
    </Налоги>
    <Товары>
${lines.map((line) => buildOrderProductXml(line)).join("\n")}
    </Товары>
    <ЗначенияРеквизитов>
${requisitesRow("Отменен", isCancelled ? "true" : "false")}
${requisitesRow("Проведен", "true")}
${requisitesRow("Адрес доставки", address)}
${requisitesRow("Способ доставки", deliveryLabel)}
${requisitesRow("Метод оплаты", paymentLabel)}
${requisitesRow("Статус заказа", statusLabel)}
    </ЗначенияРеквизитов>
  </Документ>`;
}

/**
 * Собрать `orders.xml` для `mode=query` и вернуть id очередей выгрузки,
 * которые попали в документ.
 *
 * Помечаем их `synced` не здесь, а на `mode=success`: подтверждение приходит
 * отдельным запросом, и до него заказ считается непереданным — иначе оборванный
 * обмен потерял бы заказ навсегда.
 *
 * @param {string} sellerId
 * @returns {Promise<{ xml: string; pushIds: string[]; orders: number }>}
 */
export async function buildOneCOrdersXml(sellerId) {
  const pending = await OneCOrderPushModel.find({
    sellerId,
    status: { $in: [ONEC_ORDER_PUSH_PENDING, ONEC_ORDER_PUSH_FAILED] },
    attempts: { $lt: ONEC_ORDER_PUSH_MAX_ATTEMPTS },
  })
    .sort({ createdAt: 1 })
    .limit(ORDERS_PER_QUERY)
    .lean();

  const formedAt = new Date().toISOString().slice(0, 19);
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="${formedAt}">`;

  if (pending.length === 0) {
    return { xml: `${header}\n</КоммерческаяИнформация>`, pushIds: [], orders: 0 };
  }

  const orders = await OrderModel.find({
    _id: { $in: pending.map((row) => row.orderId) },
  }).lean();
  const orderById = new Map(orders.map((row) => [String(row._id), row]));

  const buyerIds = [
    ...new Set(orders.map((row) => String(row.userBuyerId)).filter(Boolean)),
  ];
  const buyers = buyerIds.length
    ? await UserModel.find({ _id: { $in: buyerIds } })
        .select("_id userName email userPhoneNumber")
        .lean()
    : [];
  const buyerById = new Map(buyers.map((row) => [String(row._id), row]));

  const productIds = orders.flatMap((order) =>
    (order.items ?? []).map((item) => item.productId),
  );
  const products = productIds.length
    ? await ProductModel.find({
        _id: { $in: productIds },
        productSeller: sellerId,
      })
        .select("_id product1cGuid productName")
        .lean()
    : [];
  const productById = new Map(products.map((row) => [String(row._id), row]));

  /** @type {string[]} */
  const documents = [];
  /** @type {string[]} */
  const pushIds = [];

  for (const push of pending) {
    const order = orderById.get(String(push.orderId));
    if (!order) continue;

    const lines = [];
    for (const item of order.items ?? []) {
      const product = productById.get(String(item.productId));
      // Позиции чужих продавцов в сборном заказе в документ не попадают —
      // каждая 1С видит только свою часть.
      if (!product?.product1cGuid) continue;
      lines.push({
        guid: product.product1cGuid,
        name: item.productNameAtOrder || product.productName,
        quantity: item.quantity,
        price: item.unitPriceAtOrder,
      });
    }

    if (lines.length === 0) continue;

    documents.push(
      buildOrderDocument({
        order,
        lines,
        buyer: buyerById.get(String(order.userBuyerId)) ?? null,
      }),
    );
    pushIds.push(String(push._id));
  }

  return {
    xml: `${header}\n${documents.join("\n")}\n</КоммерческаяИнформация>`,
    pushIds,
    orders: documents.length,
  };
}

/**
 * `mode=success` — 1С подтвердила приём документов из последнего `query`.
 *
 * @param {string[]} pushIds
 */
export async function markOneCOrderPushesSynced(pushIds) {
  if (!Array.isArray(pushIds) || pushIds.length === 0) return { synced: 0 };

  const result = await OneCOrderPushModel.updateMany(
    { _id: { $in: pushIds }, status: { $ne: ONEC_ORDER_PUSH_SYNCED } },
    {
      $set: {
        status: ONEC_ORDER_PUSH_SYNCED,
        syncedAt: new Date(),
        lastError: "",
      },
      $inc: { attempts: 1 },
    },
  );

  return { synced: result.modifiedCount ?? 0 };
}
