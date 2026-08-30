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

/**
 * @param {unknown} value
 */
export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Управляющие символы XML 1.0 не принимает ни в каком виде — 1С на таком
    // документе падает с ошибкой разбора.
    // eslint-disable-next-line no-control-regex -- вырезаем их намеренно
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** @param {Date} date */
const formatDate = (date) => date.toISOString().slice(0, 10);
/** @param {Date} date */
const formatTime = (date) => date.toISOString().slice(11, 19);

/** @param {number} value */
const formatMoney = (value) => (Math.round(Number(value) * 100) / 100).toFixed(2);

/**
 * @param {{
 *   order: Record<string, any>;
 *   lines: Array<{ guid: string; name: string; quantity: number; price: number }>;
 *   buyer: Record<string, any> | null;
 *   sellerId: string;
 * }} params
 */
function buildOrderDocument({ order, lines, buyer, sellerId }) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const total = lines.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const externalId = `${String(order._id)}:${String(sellerId)}`;

  const contacts = [];
  if (buyer?.userPhoneNumber) {
    contacts.push(
      `        <Контакт><Тип>ТелефонРабочий</Тип><Значение>${escapeXml(buyer.userPhoneNumber)}</Значение></Контакт>`,
    );
  }
  if (buyer?.email) {
    contacts.push(
      `        <Контакт><Тип>Почта</Тип><Значение>${escapeXml(buyer.email)}</Значение></Контакт>`,
    );
  }

  const address = [order.deliveryAddress, order.deliveryAddressFlat]
    .filter(Boolean)
    .join(", ");

  return `  <Документ>
    <Ид>${escapeXml(externalId)}</Ид>
    <Номер>${escapeXml(String(order._id))}</Номер>
    <Дата>${formatDate(createdAt)}</Дата>
    <Время>${formatTime(createdAt)}</Время>
    <ХозОперация>Заказ товара</ХозОперация>
    <Роль>Продавец</Роль>
    <Валюта>руб</Валюта>
    <Курс>1</Курс>
    <Сумма>${formatMoney(total)}</Сумма>
    <Контрагенты>
      <Контрагент>
        <Ид>${escapeXml(String(order.userBuyerId ?? ""))}</Ид>
        <Наименование>${escapeXml(buyer?.userName || "Покупатель маркетплейса")}</Наименование>
        <Роль>Покупатель</Роль>
        <ПолноеНаименование>${escapeXml(buyer?.userName || "Покупатель маркетплейса")}</ПолноеНаименование>
        <Адрес><Представление>${escapeXml(address)}</Представление></Адрес>
${contacts.length > 0 ? `        <Контакты>\n${contacts.join("\n")}\n        </Контакты>\n` : ""}      </Контрагент>
    </Контрагенты>
    <Товары>
${lines
  .map(
    (line) => `      <Товар>
        <Ид>${escapeXml(line.guid)}</Ид>
        <Наименование>${escapeXml(line.name)}</Наименование>
        <БазоваяЕдиница Код="796" НаименованиеПолное="Штука" МеждународноеСокращение="PCE">шт</БазоваяЕдиница>
        <ЦенаЗаЕдиницу>${formatMoney(line.price)}</ЦенаЗаЕдиницу>
        <Количество>${line.quantity}</Количество>
        <Сумма>${formatMoney(line.price * line.quantity)}</Сумма>
      </Товар>`,
  )
  .join("\n")}
    </Товары>
    <ЗначенияРеквизитов>
      <ЗначениеРеквизита>
        <Наименование>Способ получения</Наименование>
        <Значение>${order.fulfillmentMethod === "delivery" ? "Доставка" : "Самовывоз"}</Значение>
      </ЗначениеРеквизита>
      <ЗначениеРеквизита>
        <Наименование>Метод оплаты</Наименование>
        <Значение>${escapeXml(ONEC_PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod ?? "")}</Значение>
      </ЗначениеРеквизита>
      <ЗначениеРеквизита>
        <Наименование>Статус заказа</Наименование>
        <Значение>${escapeXml(ONEC_ORDER_STATUS_LABELS[order.status] ?? order.status ?? "")}</Значение>
      </ЗначениеРеквизита>
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

  const header = `<?xml version="1.0" encoding="UTF-8"?>
<КоммерческаяИнформация ВерсияСхемы="2.05" ДатаФормирования="${new Date().toISOString().slice(0, 19)}">`;

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
        sellerId,
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
